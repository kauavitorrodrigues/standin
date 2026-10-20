import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { AVATAR_SHEET_PX } from "@standin/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Exercises the routes of the avatar bases and categories over the real
// Express stack against a real Postgres. Off unless INTEGRATION_DATABASE_URL
// points at a throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "member";
type Json = any;

// Every base of the list, whatever the kind, in the order of the groups.
const allBases = (body: Json): Json[] =>
    (body.groups as Json[]).flatMap((group) => group.bases as Json[]);

describe.skipIf(!enabled)("avatar bases and categories over HTTP", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;

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

    const sheet = (shade = 90) =>
        core.encodePng(
            AVATAR_SHEET_PX.w,
            AVATAR_SHEET_PX.h,
            Array.from(
                { length: AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h },
                () => [shade, shade, shade, 255]
            )
        );
    const preview = (size = 24) =>
        core.encodePng(
            size,
            size,
            Array.from({ length: size * size }, () => [200, 40, 40, 255])
        );

    type Parts = { image?: Buffer; preview?: Buffer; data?: unknown };
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

    const createBase = (parts: Parts, as: UserKey | null = "admin") =>
        send(as, "POST", "/library/avatar-bases", parts);

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        const { db, usersTable } = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@avatar-bases.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("member", "USER");

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
        it("lets only the admin use the base and category routes", async () => {
            const parts = { image: sheet(), data: { name: `who-${RUN}` } };

            expect((await createBase(parts, null)).status).toBe(401);
            expect((await createBase(parts, "member")).status).toBe(403);
            expect(
                (await call("member", "GET", "/library/avatar-categories"))
                    .status
            ).toBe(403);
            expect((await createBase(parts)).status).toBe(201);
        });
    });

    describe("bases", () => {
        it("creates a base with a preview and derives the key", async () => {
            const response = await createBase({
                image: sheet(),
                preview: preview(),
                data: { name: `Blank ${RUN}` },
            });

            expect(response.status).toBe(201);
            expect(response.body.warnings).toEqual([]);
            expect(response.body.base).toMatchObject({
                name: `Blank ${RUN}`,
                key: `blank-${RUN}`,
                deletedAt: null,
            });
            expect(response.body.base.url).toMatch(/^\/files\//);
            expect(response.body.base.previewUrl).toMatch(/^\/files\//);
        });

        it("refuses a sheet with the wrong size", async () => {
            const response = await createBase({
                image: preview(32),
                data: { name: `Wrong ${RUN}` },
            });

            expect(response.status).toBe(422);
        });

        it("refuses a taken key", async () => {
            const data = { name: `Taken ${RUN}`, key: `taken-${RUN}` };
            expect((await createBase({ image: sheet(), data })).status).toBe(
                201
            );

            const again = await createBase({ image: sheet(), data });

            expect(again.status).toBe(409);
        });

        it("moves the default flag to the new default", async () => {
            const first = await createBase({
                image: sheet(),
                data: { name: `First ${RUN}`, isDefault: true },
            });
            const second = await createBase({
                image: sheet(),
                data: { name: `Second ${RUN}` },
            });
            expect(first.body.base.isDefault).toBe(true);
            expect(second.body.base.isDefault).toBe(false);

            const patched = await call(
                "admin",
                "PATCH",
                `/library/avatar-bases/${second.body.base.id}`,
                { isDefault: true }
            );
            const list = await call("admin", "GET", "/library/avatar-bases");
            const defaults = allBases(list.body).filter(
                (base) => base.kind === "BODY" && base.isDefault
            );

            expect(patched.status).toBe(200);
            expect(defaults.map((base) => base.id)).toEqual([
                second.body.base.id,
            ]);
            const bodies = list.body.groups.find(
                (group: Json) => group.kind === "BODY"
            );
            expect(bodies.bases[0].id).toBe(second.body.base.id);
        });

        it("refuses to delete the default and deletes another one", async () => {
            const other = await createBase({
                image: sheet(),
                data: { name: `Other ${RUN}` },
            });
            const list = await call("admin", "GET", "/library/avatar-bases");
            const current = allBases(list.body).find((base) => base.isDefault);

            const refused = await call(
                "admin",
                "DELETE",
                `/library/avatar-bases/${current.id}`
            );
            const deleted = await call(
                "admin",
                "DELETE",
                `/library/avatar-bases/${other.body.base.id}`
            );

            expect(refused.status).toBe(409);
            expect(deleted.status).toBe(204);
        });

        it("replaces the sheet and gives it a new file", async () => {
            const created = await createBase({
                image: sheet(),
                data: { name: `Swap ${RUN}` },
            });

            const replaced = await send(
                "admin",
                "PUT",
                `/library/avatar-bases/${created.body.base.id}/image`,
                { image: sheet(40) }
            );

            expect(replaced.status).toBe(200);
            expect(replaced.body.base.url).not.toBe(created.body.base.url);
        });

        it("sets and removes the preview of a base", async () => {
            const created = await createBase({
                image: sheet(),
                data: { name: `Preview ${RUN}` },
            });
            const route = `/library/avatar-bases/${created.body.base.id}/preview`;

            const put = await send("admin", "PUT", route, {
                image: preview(),
            });
            const bad = await send("admin", "PUT", route, {
                image: Buffer.from("not a png"),
            });
            const removed = await call("admin", "DELETE", route);

            expect(put.status).toBe(200);
            expect(put.body.base.previewUrl).toMatch(/^\/files\//);
            expect(bad.status).toBe(415);
            expect(removed.status).toBe(200);
            expect(removed.body.base.previewUrl).toBeNull();
        });
    });

    describe("mannequins", () => {
        const bodyDefaultId = async () => {
            const list = await call("admin", "GET", "/library/avatar-bases");
            return allBases(list.body).find(
                (base) => base.kind === "BODY" && base.isDefault
            )?.id as string | undefined;
        };

        it("creates a mannequin and keeps the kind in the list", async () => {
            const response = await createBase({
                image: sheet(),
                data: { name: `Doll ${RUN}`, kind: "MANNEQUIN" },
            });

            expect(response.status).toBe(201);
            expect(response.body.base.kind).toBe("MANNEQUIN");

            const bodies = await createBase({
                image: sheet(),
                data: { name: `Body kind ${RUN}` },
            });
            expect(bodies.body.base.kind).toBe("BODY");
        });

        it("groups the list by kind, the bodies first, both always there", async () => {
            const list = await call("admin", "GET", "/library/avatar-bases");
            const groups = list.body.groups as Json[];

            expect(list.body).not.toHaveProperty("bases");
            expect(groups.map((group) => group.kind)).toEqual([
                "BODY",
                "MANNEQUIN",
            ]);
            for (const group of groups) {
                expect(
                    (group.bases as Json[]).every(
                        (base) => base.kind === group.kind
                    )
                ).toBe(true);
            }
        });

        it("keeps one default for each kind", async () => {
            await createBase({
                image: sheet(),
                data: { name: `Body default ${RUN}`, isDefault: true },
            });
            const bodyBefore = await bodyDefaultId();
            const second = await createBase({
                image: sheet(),
                data: {
                    name: `Doll two ${RUN}`,
                    kind: "MANNEQUIN",
                    isDefault: true,
                },
            });

            const list = await call("admin", "GET", "/library/avatar-bases");
            const defaults = allBases(list.body).filter(
                (base) => base.isDefault
            );

            expect(second.body.base.isDefault).toBe(true);
            expect(
                defaults.filter((base) => base.kind === "MANNEQUIN")
            ).toHaveLength(1);
            expect(defaults.find((base) => base.kind === "MANNEQUIN").id).toBe(
                second.body.base.id
            );
            expect(await bodyDefaultId()).toBe(bodyBefore);
        });

        it("turns a mannequin into the default without touching the body default", async () => {
            const bodyBefore = await bodyDefaultId();
            const other = await createBase({
                image: sheet(),
                data: { name: `Doll three ${RUN}`, kind: "MANNEQUIN" },
            });

            const patched = await call(
                "admin",
                "PATCH",
                `/library/avatar-bases/${other.body.base.id}`,
                { isDefault: true }
            );

            expect(patched.status).toBe(200);
            expect(patched.body.base.kind).toBe("MANNEQUIN");
            expect(await bodyDefaultId()).toBe(bodyBefore);
        });

        it("never changes the kind of a base", async () => {
            const created = await createBase({
                image: sheet(),
                data: { name: `Fixed kind ${RUN}` },
            });

            const patched = await call(
                "admin",
                "PATCH",
                `/library/avatar-bases/${created.body.base.id}`,
                { kind: "MANNEQUIN" }
            );

            expect(patched.status).toBe(400);
        });

        it("refuses to delete the default mannequin", async () => {
            const list = await call("admin", "GET", "/library/avatar-bases");
            const current = allBases(list.body).find(
                (base) => base.kind === "MANNEQUIN" && base.isDefault
            );

            const response = await call(
                "admin",
                "DELETE",
                `/library/avatar-bases/${current.id}`
            );

            expect(response.status).toBe(409);
        });

        it("refuses an unknown kind", async () => {
            const response = await createBase({
                image: sheet(),
                data: { name: `Odd ${RUN}`, kind: "HEAD" },
            });

            // The multipart `data` is read by the shared upload helper, which
            // answers 422 for a body that does not fit the schema.
            expect(response.status).toBe(422);
        });
    });

    describe("categories", () => {
        it("lists the seeded categories in order", async () => {
            const response = await call(
                "admin",
                "GET",
                "/library/avatar-categories"
            );

            expect(response.status).toBe(200);
            expect(response.body.categories).toHaveLength(11);
            const orders = (response.body.categories as Json[]).map(
                (category) => category.sortOrder
            );
            expect(orders).toEqual([...orders].sort((a, b) => a - b));
        });

        it("renames a category and sets its image", async () => {
            const patched = await call(
                "admin",
                "PATCH",
                "/library/avatar-categories/HAIR",
                { name: `Hair ${RUN}` }
            );
            const put = await send(
                "admin",
                "PUT",
                "/library/avatar-categories/HAIR/preview",
                { image: preview() }
            );
            const removed = await call(
                "admin",
                "DELETE",
                "/library/avatar-categories/HAIR/preview"
            );

            expect(patched.status).toBe(200);
            expect(patched.body.category.name).toBe(`Hair ${RUN}`);
            expect(put.body.category.previewUrl).toMatch(/^\/files\//);
            expect(removed.body.category.previewUrl).toBeNull();
        });

        it("rejects an unknown slot and an empty update", async () => {
            const unknown = await call(
                "admin",
                "PATCH",
                "/library/avatar-categories/NOPE",
                { name: "x" }
            );
            const empty = await call(
                "admin",
                "PATCH",
                "/library/avatar-categories/HAIR",
                {}
            );

            expect(unknown.status).toBe(400);
            expect(empty.status).toBe(400);
        });
    });
});
