import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import {
    AVATAR_PART_MAX_BYTES,
    AVATAR_SHEET_PX,
    LIBRARY_ISSUE_CODES,
} from "@standin/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Exercises the routes of the avatar parts over the real Express stack (auth,
// admin guard, multer, controllers, error mapping) against a real Postgres.
// Off unless INTEGRATION_DATABASE_URL points at a throwaway database different
// from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "owner" | "member";
type Json = any;

describe.skipIf(!enabled)("avatar parts over HTTP (real stack)", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    let organizationId: string;

    const call = async (
        as: UserKey | null,
        method: string,
        route: string,
        body?: unknown,
        raw?: FormData
    ) => {
        const headers: Record<string, string> = {};
        if (as) headers.cookie = `token=${createToken(users[as])}`;
        if (body !== undefined) headers["content-type"] = "application/json";

        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body:
                raw ?? (body === undefined ? undefined : JSON.stringify(body)),
        });
        const text = await response.text();
        let json: Json = null;
        try {
            json = text ? JSON.parse(text) : null;
        } catch {
            json = text;
        }
        return { status: response.status, body: json };
    };

    const sheet = (shade = 90, alpha = 255) =>
        core.encodePng(
            AVATAR_SHEET_PX.w,
            AVATAR_SHEET_PX.h,
            Array.from(
                { length: AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h },
                () => [shade, shade, shade, alpha]
            )
        );

    type Parts = {
        image?: Buffer;
        preview?: Buffer;
        data?: unknown;
    };
    const form = ({ image, preview, data }: Parts) => {
        const body = new FormData();
        const png = (name: string, bytes: Buffer) =>
            body.append(
                name,
                new Blob([new Uint8Array(bytes)], { type: "image/png" }),
                `${name}.png`
            );
        if (image) png("image", image);
        if (preview) png("preview", preview);
        if (data !== undefined) {
            body.append(
                "data",
                new Blob([JSON.stringify(data)], { type: "application/json" }),
                "data.json"
            );
        }
        return body;
    };
    const send = (
        as: UserKey | null,
        method: "POST" | "PUT",
        route: string,
        parts: Parts
    ) => call(as, method, route, undefined, form(parts));

    const createPart = (parts: Parts, as: UserKey | null = "admin") =>
        send(as, "POST", "/library/avatar-parts", parts);

    const hair = (name: string, extra: Record<string, unknown> = {}) => ({
        name,
        slot: "HAIR",
        ...extra,
    });

    const listed = async (query = "") => {
        const response = await call(
            "admin",
            "GET",
            `/library/avatar-parts${query}`
        );
        const parts = (response.body.slots as Json[]).flatMap(
            ({ parts }) => parts
        ) as Json[];
        return { response, parts };
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        const database = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable, organizationMembersTable } = database;
        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@avatar-parts.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await make("member", "USER");

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Avatar Parts Org" }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values({
            userId: users.member.id,
            organizationId,
            role: "MEMBER",
        });

        server = http.createServer(createApp());
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("who can write", () => {
        it("lets only the admin use the part routes", async () => {
            const parts = {
                image: sheet(),
                preview: sheet(1),
                data: hair(`who-${RUN}`),
            };

            expect((await createPart(parts, null)).status).toBe(401);
            for (const as of ["member", "owner"] as const) {
                expect((await createPart(parts, as)).status).toBe(403);
                expect(
                    (await call(as, "GET", "/library/avatar-parts")).status
                ).toBe(403);
            }
            expect((await createPart(parts)).status).toBe(201);
        });

        it("keeps the parts out of the library of an organization", async () => {
            const response = await call(
                "owner",
                "GET",
                `/organizations/${organizationId}/library/avatar-parts`
            );

            expect(response.status).toBe(404);
        });
    });

    describe("create", () => {
        it("creates a part from a sprite and a preview, and derives the key", async () => {
            const response = await createPart({
                image: sheet(),
                preview: sheet(1),
                data: hair(`Cabelo Curto ${RUN}`),
            });

            expect(response.status).toBe(201);
            expect(response.body.warnings).toEqual([]);
            expect(response.body.part).toMatchObject({
                name: `Cabelo Curto ${RUN}`,
                slot: "HAIR",
                colorKey: null,
                colorHex: null,
                basePartId: null,
            });
            expect(response.body.part.key).toBe(`hair-cabelo-curto-${RUN}`);
            expect(response.body.part.url).toMatch(/^\/files\//);
            expect(response.body.part.previewUrl).toMatch(/^\/files\//);
        });

        it("adds a suffix when the derived key is taken", async () => {
            const parts = {
                image: sheet(),
                preview: sheet(1),
                data: hair(`Repetida ${RUN}`),
            };
            const first = await createPart(parts);
            const second = await createPart(parts);

            expect(second.body.part.key).toBe(`${first.body.part.key}-2`);
        });

        it("answers 409 for a key that is taken", async () => {
            const data = hair(`Chave ${RUN}`, { key: `taken-${RUN}` });
            await createPart({ image: sheet(), preview: sheet(1), data });
            const response = await createPart({
                image: sheet(),
                preview: sheet(1),
                data,
            });

            expect(response.status).toBe(409);
            expect(response.body.code).toBe("AVATAR_PART_KEY_TAKEN");
        });

        it("warns about partial alpha without refusing", async () => {
            const response = await createPart({
                image: sheet(90, 128),
                preview: sheet(1),
                data: hair(`Suave ${RUN}`),
            });

            expect(response.status).toBe(201);
            expect(response.body.warnings).toEqual([
                { sheet: "front", code: "ALPHA_INTERMEDIATE" },
            ]);
        });

        it("answers 422 for a sheet with the wrong size", async () => {
            const response = await createPart({
                image: core.encodePng(
                    32,
                    32,
                    Array.from({ length: 1024 }, () => [1, 1, 1, 255])
                ),
                preview: sheet(1),
                data: hair(`Tamanho ${RUN}`),
            });

            expect(response.status).toBe(422);
            expect(response.body.code).toBe("AVATAR_SHEET_INVALID_SIZE");
        });

        it("answers 415 for bytes that are not a PNG", async () => {
            const response = await createPart({
                image: Buffer.from("this is text, not a PNG file at all"),
                preview: sheet(1),
                data: hair(`Texto ${RUN}`),
            });

            expect(response.status).toBe(415);
            expect(response.body.code).toBe("AVATAR_SHEET_INVALID_FORMAT");
        });

        it("answers 413 for a sheet above the byte limit", async () => {
            const response = await createPart({
                image: Buffer.alloc(AVATAR_PART_MAX_BYTES + 1024),
                preview: sheet(1),
                data: hair(`Grande ${RUN}`),
            });

            expect(response.status).toBe(413);
            expect(response.body.code).toBe("AVATAR_SHEET_TOO_LARGE");
        });

        it("answers 422 without the sprite image", async () => {
            const response = await createPart({
                preview: sheet(1),
                data: hair(`Sem ${RUN}`),
            });

            expect(response.status).toBe(422);
            expect(response.body.code).toBe(
                LIBRARY_ISSUE_CODES.IMAGE_FILE_REQUIRED
            );
        });

        it("answers 422 without the preview image", async () => {
            const response = await createPart({
                image: sheet(),
                data: hair(`Sem preview ${RUN}`),
            });

            expect(response.status).toBe(422);
            expect(response.body.code).toBe(
                LIBRARY_ISSUE_CODES.PREVIEW_FILE_REQUIRED
            );
        });
    });

    describe("list", () => {
        it("groups the parts by slot in the order of the tabs", async () => {
            await createPart({
                image: sheet(),
                preview: sheet(1),
                data: hair(`Lista ${RUN}`),
            });

            const { response, parts } = await listed();

            expect(response.status).toBe(200);
            expect(
                (response.body.slots as Json[]).map(({ slot }) => slot)
            ).toEqual([
                "SKIN",
                "HAIR",
                "FACIAL_HAIR",
                "TOP",
                "JACKET",
                "BOTTOM",
                "SHOES",
                "HAT",
                "GLASSES",
                "OTHER",
                "COSTUME",
            ]);
            expect(parts.some(({ name }) => name === `Lista ${RUN}`)).toBe(
                true
            );
        });

        it("filters by slot and by search", async () => {
            await createPart({
                image: sheet(),
                preview: sheet(1),
                data: hair(`Filtro ${RUN}`, { slot: "HAT" }),
            });

            const { response, parts } = await listed(
                `?slot=HAT&search=Filtro ${RUN}`
            );

            expect(response.body.slots).toHaveLength(1);
            expect(parts.map(({ name }) => name)).toEqual([`Filtro ${RUN}`]);
        });

        it("refuses an unknown slot", async () => {
            const response = await call(
                "admin",
                "GET",
                "/library/avatar-parts?slot=NOPE"
            );

            expect(response.status).toBe(400);
        });
    });

    describe("variations", () => {
        const createBase = async (name: string) => {
            const response = await createPart({
                image: sheet(),
                preview: sheet(1),
                data: hair(`${name} ${RUN}`, {
                    colorKey: "Black",
                    colorHex: "#000000",
                }),
            });
            return response.body.part as Json;
        };

        const addVariation = (
            baseId: string,
            data: Record<string, unknown>,
            as: UserKey | null = "admin"
        ) =>
            send(as, "POST", `/library/avatar-parts/${baseId}/variations`, {
                image: sheet(60),
                preview: sheet(1),
                data,
            });

        it("adds a color to a base and lists the family", async () => {
            const base = await createBase("Familia");

            const response = await addVariation(base.id, {
                colorKey: "Blonde",
                colorHex: "#F2B55B",
            });

            expect(response.status).toBe(201);
            expect(response.body.part.id).toBe(base.id);
            const rows = response.body.part.variations as Json[];
            expect(rows.map(({ colorKey }) => colorKey)).toEqual([
                "Black",
                "Blonde",
            ]);
            expect(rows[1]).toMatchObject({
                basePartId: base.id,
                name: base.name,
                slot: "HAIR",
                key: `${base.key}-blonde`,
            });

            const { parts } = await listed();
            const family = parts.find(({ id }) => id === base.id);
            expect(family.variations).toHaveLength(2);
            expect(parts.some(({ id }) => id === rows[1].id)).toBe(false);
        });

        it("refuses a repeated color, a base without color and a variation as base", async () => {
            const base = await createBase("Repetida");
            const added = await addVariation(base.id, {
                colorKey: "Red",
                colorHex: "#FF0000",
            });
            const variationId = added.body.part.variations[1].id as string;

            expect(
                (
                    await addVariation(base.id, {
                        colorKey: "Red",
                        colorHex: "#FF0001",
                    })
                ).status
            ).toBe(409);
            expect(
                (
                    await addVariation(variationId, {
                        colorKey: "Blue",
                        colorHex: "#0000FF",
                    })
                ).status
            ).toBe(422);

            const plain = (
                await createPart({
                    image: sheet(),
                    preview: sheet(1),
                    data: hair(`Sem cor ${RUN}`),
                })
            ).body.part as Json;
            expect(
                (
                    await addVariation(plain.id, {
                        colorKey: "Blue",
                        colorHex: "#0000FF",
                    })
                ).status
            ).toBe(422);
        });

        it("shares the name and deletes the family with the base", async () => {
            const base = await createBase("Compartilhada");
            const added = await addVariation(base.id, {
                colorKey: "Red",
                colorHex: "#FF0000",
            });
            const variationId = added.body.part.variations[1].id as string;

            const renamed = await call(
                "admin",
                "PATCH",
                `/library/avatar-parts/${variationId}`,
                { name: "Nome novo" }
            );
            expect(
                (renamed.body.part.variations as Json[]).map(({ name }) => name)
            ).toEqual(["Nome novo", "Nome novo"]);

            const deleted = await call(
                "admin",
                "DELETE",
                `/library/avatar-parts/${base.id}`
            );
            expect(deleted.status).toBe(204);
            const after = await listed();
            expect(after.parts.some(({ id }) => id === base.id)).toBe(false);
        });
    });

    describe("update, swap and delete", () => {
        const create = async (name: string) => {
            const response = await createPart({
                image: sheet(),
                preview: sheet(1),
                data: hair(`${name} ${RUN}`),
            });
            return response.body.part as Json;
        };

        it("changes the name and the color", async () => {
            const part = await create("Editar");

            const response = await call(
                "admin",
                "PATCH",
                `/library/avatar-parts/${part.id}`,
                { name: "Outro nome", colorKey: "Red", colorHex: "#FF0000" }
            );

            expect(response.status).toBe(200);
            expect(response.body.part).toMatchObject({
                id: part.id,
                name: "Outro nome",
                colorKey: "Red",
                colorHex: "#FF0000",
                key: part.key,
            });
        });

        it("refuses an empty update and an unknown part", async () => {
            const part = await create("Vazio");

            expect(
                (
                    await call(
                        "admin",
                        "PATCH",
                        `/library/avatar-parts/${part.id}`,
                        {}
                    )
                ).status
            ).toBe(400);
            const missing = await call(
                "admin",
                "PATCH",
                "/library/avatar-parts/does-not-exist",
                { name: "x" }
            );
            expect(missing.status).toBe(404);
            expect(missing.body.code).toBe("AVATAR_PART_NOT_FOUND");
        });

        it("swaps the front sheet and creates a new file", async () => {
            const part = await create("Frente");

            const response = await send(
                "admin",
                "PUT",
                `/library/avatar-parts/${part.id}/image`,
                { image: sheet(120) }
            );

            expect(response.status).toBe(200);
            expect(response.body.part.url).not.toBe(part.url);
            const old = await fetch(`${baseUrl}${part.url}`);
            expect(old.status).toBe(404);
            const fresh = await fetch(`${baseUrl}${response.body.part.url}`);
            expect(fresh.status).toBe(200);
        });

        it("refuses a front swap with the wrong size or without a file", async () => {
            const part = await create("Frente errada");
            const route = `/library/avatar-parts/${part.id}/image`;

            const wrong = await send("admin", "PUT", route, {
                image: core.encodePng(
                    32,
                    32,
                    Array.from({ length: 1024 }, () => [1, 1, 1, 255])
                ),
            });
            const missing = await send("admin", "PUT", route, {});

            expect(wrong.status).toBe(422);
            expect(wrong.body.code).toBe("AVATAR_SHEET_INVALID_SIZE");
            expect(missing.status).toBe(422);
        });

        it("deletes a part and hides it from the list", async () => {
            const part = await create("Excluir");

            const deleted = await call(
                "admin",
                "DELETE",
                `/library/avatar-parts/${part.id}`
            );
            expect(deleted.status).toBe(204);

            const active = await listed();
            expect(active.parts.some(({ id }) => id === part.id)).toBe(false);

            const again = await call(
                "admin",
                "DELETE",
                `/library/avatar-parts/${part.id}`
            );
            expect(again.status).toBe(404);
            expect(again.body.code).toBe("AVATAR_PART_NOT_FOUND");
        });

        it("frees the key of a deleted part", async () => {
            const key = `reuse-${RUN}`;
            const first = await createPart({
                image: sheet(),
                preview: sheet(1),
                data: hair(`Reuso ${RUN}`, { key }),
            });
            await call(
                "admin",
                "DELETE",
                `/library/avatar-parts/${first.body.part.id}`
            );

            const second = await createPart({
                image: sheet(),
                preview: sheet(1),
                data: hair(`Reuso ${RUN}`, { key }),
            });

            expect(second.status).toBe(201);
        });
    });
});
