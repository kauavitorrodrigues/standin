import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { AVATAR_PARTS_PAGE, AVATAR_SHEET_PX } from "@standin/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// The avatar of a user over the real Express stack, against a real Postgres:
// the editor endpoints, save, read, clear, the base, the hash, the
// regeneration of a stale sheet and the event that runs before the old file
// goes away. Off unless INTEGRATION_DATABASE_URL points at a throwaway
// database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "ana" | "bruno" | "carla";
type Json = any;

// Every base of the list, whatever the kind, in the order of the groups.
const allBases = (body: Json): Json[] =>
    (body.groups as Json[]).flatMap((group) => group.bases as Json[]);
type Created = { id: string; variations: { id: string }[] };

describe.skipIf(!enabled)("user avatar over HTTP (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    const part = {} as Record<
        "skin" | "hair" | "top" | "costume",
        { id: string }
    >;
    // The red variation of the hair, its own row of the family.
    let redHair: { id: string };
    // `a` and `b` are bodies, `doll` is a mannequin.
    const base = {} as Record<
        "a" | "b" | "doll",
        { id: string; fileId: string }
    >;

    const call = async (
        as: UserKey | null,
        method: string,
        route: string,
        body?: unknown
    ) => {
        const headers: Record<string, string> = {};
        if (as) headers.cookie = `token=${createToken(users[as])}`;
        if (body !== undefined) headers["content-type"] = "application/json";

        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
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

    const sheet = (shade: number) =>
        core.encodePng(
            AVATAR_SHEET_PX.w,
            AVATAR_SHEET_PX.h,
            Array.from(
                { length: AVATAR_SHEET_PX.w * AVATAR_SHEET_PX.h },
                () => [shade, shade, shade, 255]
            )
        );

    const fileIdOf = (fileUrl: string) => fileUrl.replace("/files/", "");

    const newPart = async (
        name: string,
        slot: string,
        {
            color,
        }: { color?: { key: string; hex: string } } = {}
    ): Promise<Created> => {
        const { part: created } = await core.AvatarService.createPart(
            { buffer: sheet(100) },
            { buffer: sheet(200) },
            {
                name: `${name} ${RUN}`,
                slot: slot as never,
                colorKey: color?.key,
                colorHex: color?.hex,
            },
            { createdBy: users.admin.id }
        );
        return created;
    };

    const newBase = async (
        name: string,
        isDefault: boolean,
        shade: number,
        kind: "BODY" | "MANNEQUIN" = "BODY"
    ) => {
        const { base: created } = await core.AvatarService.createBase(
            { buffer: sheet(shade) },
            undefined,
            { name: `${name} ${RUN}`, kind, isDefault },
            { createdBy: users.admin.id }
        );
        return { id: created.id, fileId: fileIdOf(created.url) };
    };

    // Whatever base is the default now, since another suite may move it.
    const defaultBase = async () => {
        const list = await call("admin", "GET", "/library/avatar-bases");
        const found = allBases(list.body).find(
            ({ kind, isDefault }) => kind === "BODY" && isDefault
        );
        return { id: found.id as string, fileId: fileIdOf(found.url) };
    };

    const storedHash = async (userId: string) => {
        const { db, userAvatarSheetsTable, eq } = database;
        const [row] = await db
            .select({
                hash: userAvatarSheetsTable.configHash,
                fileId: userAvatarSheetsTable.fileId,
            })
            .from(userAvatarSheetsTable)
            .where(eq(userAvatarSheetsTable.userId, userId));
        return row;
    };

    const fileStatus = async (fileId: string) =>
        (await fetch(`${baseUrl}/files/${fileId}`)).status;

    const SAVE = () => ({
        parts: [
            { slot: "SKIN", partId: part.skin.id },
            { slot: "HAIR", partId: part.hair.id },
        ],
    });

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        database = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable } = database;
        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@avatar.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("ana", "USER");
        await make("bruno", "USER");
        await make("carla", "USER");

        base.a = await newBase("Blank A", true, 90);
        base.b = await newBase("Blank B", false, 40);
        base.doll = await newBase("Doll", false, 60, "MANNEQUIN");

        part.skin = await newPart("Pele", "SKIN");
        part.hair = await newPart("Cabelo", "HAIR", {
            color: { key: "black", hex: "#32343B" },
        });
        part.top = await newPart("Camiseta", "TOP");
        part.costume = await newPart("Fantasia", "COSTUME");

        const { part: family } = await core.AvatarService.createVariation(
            part.hair.id,
            { buffer: sheet(80) },
            { buffer: sheet(210) },
            { colorKey: "red", colorHex: "#F03827" },
            { createdBy: users.admin.id }
        );
        redHair = family.variations.find(({ colorKey }) => colorKey === "red")!;

        server = http.createServer(createApp());
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("editor", () => {
        it("asks for a signed in user", async () => {
            expect((await call(null, "GET", "/avatar/editor")).status).toBe(
                401
            );
        });

        it("answers the categories, the bases and what the person uses, without any part", async () => {
            const response = await call("carla", "GET", "/avatar/editor");

            expect(response.status).toBe(200);
            const categories = response.body.categories as Json[];
            expect(categories).toHaveLength(11);
            expect(categories[0]).toEqual({
                slot: expect.any(String),
                name: expect.any(String),
                previewUrl: null,
            });
            expect(response.body.bases).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: base.a.id,
                        url: `/files/${base.a.fileId}`,
                    }),
                    expect.objectContaining({
                        id: base.b.id,
                        isDefault: false,
                    }),
                ])
            );
            expect(
                (response.body.bases as Json[]).filter(
                    ({ isDefault }) => isDefault
                )
            ).toHaveLength(1);
            expect(response.body.current).toEqual({ baseId: null, parts: [] });
            expect(response.body).not.toHaveProperty("slots");
        });

        it("never lists a mannequin among the bases", async () => {
            const response = await call("carla", "GET", "/avatar/editor");
            const ids = (response.body.bases as Json[]).map(({ id }) => id);

            expect(ids).toContain(base.a.id);
            expect(ids).not.toContain(base.doll.id);
        });

        it("answers what the person uses, with the family of each part", async () => {
            await call("ana", "PUT", "/users/me/avatar", {
                baseId: base.b.id,
                parts: [{ slot: "HAIR", partId: redHair.id }],
            });

            const response = await call("ana", "GET", "/avatar/editor");

            expect(response.body.current.baseId).toBe(base.b.id);
            expect(response.body.current.parts).toEqual([
                {
                    slot: "HAIR",
                    partId: redHair.id,
                    familyId: part.hair.id,
                    url: expect.stringMatching(/^\/files\//),
                },
            ]);
        });

        it("does not answer the old catalog anymore", async () => {
            expect((await call("ana", "GET", "/avatar/parts")).status).toBe(
                404
            );
        });
    });

    describe("parts of a category", () => {
        const hats = [] as Created[];
        const hatName = (index: number) => `Chapeu ${index} ${RUN}`;
        const route = (query = "") => `/avatar/categories/HAT/parts${query}`;

        // Walks every page of the slot, which may hold parts of other suites.
        const walk = async (limit: number) => {
            const ids: string[] = [];
            const sizes: number[] = [];
            let cursor: string | null = null;
            for (let page = 0; page < 500; page++) {
                const query: string = `?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`;
                const response = await call("ana", "GET", route(query));
                expect(response.status).toBe(200);
                sizes.push(response.body.items.length);
                ids.push(...response.body.items.map(({ id }: Json) => id));
                cursor = response.body.nextCursor;
                if (cursor === null) return { ids, sizes };
            }
            throw new Error("the pages never ended");
        };

        beforeAll(async () => {
            for (const index of [1, 2, 3, 4, 5]) {
                hats.push(
                    await newPart(
                        `Chapeu ${index}`,
                        "HAT",
                        index === 1
                            ? { color: { key: "black", hex: "#32343B" } }
                            : {}
                    )
                );
            }
            await core.AvatarService.createVariation(
                hats[0]!.id,
                { buffer: sheet(70) },
                { buffer: sheet(220) },
                { colorKey: "red", colorHex: "#F03827" },
                { createdBy: users.admin.id }
            );
        });

        it("asks for a signed in user", async () => {
            expect((await call(null, "GET", route())).status).toBe(401);
        });

        it("answers one page with a cursor for the next", async () => {
            const response = await call("ana", "GET", route("?limit=2"));

            expect(response.status).toBe(200);
            expect(response.body.items).toHaveLength(2);
            expect(response.body.nextCursor).toEqual(expect.any(String));
        });

        it("walks every part once, in order, within the page size", async () => {
            const { ids, sizes } = await walk(2);

            expect(new Set(ids).size).toBe(ids.length);
            expect(Math.max(...sizes)).toBeLessThanOrEqual(2);
            const ours = ids.filter((id) => hats.some((hat) => hat.id === id));
            expect(ours).toEqual(hats.map(({ id }) => id));
        });

        it("nests the colors of a family, the base first", async () => {
            const { ids } = await walk(AVATAR_PARTS_PAGE.max);
            expect(ids).toContain(hats[0]!.id);

            const all: Json[] = [];
            let cursor: string | null = null;
            do {
                const query: string = `?limit=${AVATAR_PARTS_PAGE.max}${cursor ? `&cursor=${cursor}` : ""}`;
                const page: { body: Json } = await call(
                    "ana",
                    "GET",
                    route(query)
                );
                all.push(...page.body.items);
                cursor = page.body.nextCursor;
            } while (cursor !== null);

            const colored = all.find(({ id }) => id === hats[0]!.id);
            expect(colored.name).toBe(hatName(1));
            expect(colored.variations).toHaveLength(2);
            expect(colored.variations[0]).toMatchObject({
                id: hats[0]!.id,
                colorKey: "black",
                colorHex: "#32343B",
                url: expect.stringMatching(/^\/files\//),
            });
            expect(colored.variations[1]).toMatchObject({
                colorKey: "red",
                colorHex: "#F03827",
            });

            const plain = all.find(({ id }) => id === hats[1]!.id);
            expect(plain.variations).toEqual([
                expect.objectContaining({
                    id: hats[1]!.id,
                    colorKey: null,
                    colorHex: null,
                }),
            ]);
        });

        it("answers the default page size when no limit is asked", async () => {
            const response = await call("ana", "GET", route());

            expect(response.status).toBe(200);
            expect(response.body.items.length).toBeLessThanOrEqual(
                AVATAR_PARTS_PAGE.default
            );
        });

        it("answers 400 AVATAR_PART_CURSOR_INVALID for a cursor it did not issue", async () => {
            const response = await call(
                "ana",
                "GET",
                route("?cursor=not-a-cursor")
            );

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("AVATAR_PART_CURSOR_INVALID");
        });

        it("answers 400 for a limit above the maximum, below one, or a slot that does not exist", async () => {
            const above = await call(
                "ana",
                "GET",
                route(`?limit=${AVATAR_PARTS_PAGE.max + 1}`)
            );
            const below = await call("ana", "GET", route("?limit=0"));
            const unknown = await call(
                "ana",
                "GET",
                "/avatar/categories/NOPE/parts"
            );

            expect(above.status).toBe(400);
            expect(below.status).toBe(400);
            expect(unknown.status).toBe(400);
        });

        it("leaves a deleted family out of the list", async () => {
            await call(
                "admin",
                "DELETE",
                `/library/avatar-parts/${hats[4]!.id}`
            );

            const { ids } = await walk(AVATAR_PARTS_PAGE.max);

            expect(ids).not.toContain(hats[4]!.id);
            expect(ids).toContain(hats[3]!.id);
        });
    });

    describe("read, save and clear", () => {
        it("asks for a signed in user", async () => {
            for (const method of ["GET", "PUT", "DELETE"]) {
                expect(
                    (
                        await call(
                            null,
                            method,
                            "/users/me/avatar",
                            method === "PUT" ? { parts: [] } : undefined
                        )
                    ).status
                ).toBe(401);
            }
        });

        it("draws a user who never chose with the default base", async () => {
            const response = await call("carla", "GET", "/users/me/avatar");

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                baseId: null,
                parts: [],
                avatarSheetFileId: (await defaultBase()).fileId,
            });
            expect(await storedHash(users.carla.id)).toBeUndefined();
        });

        it("saves the avatar, assembles the sheet and serves it", async () => {
            const saved = await call("ana", "PUT", "/users/me/avatar", SAVE());

            expect(saved.status).toBe(200);
            expect(saved.body.parts).toEqual([
                { slot: "SKIN", partId: part.skin.id },
                { slot: "HAIR", partId: part.hair.id },
            ]);
            expect(saved.body.avatarSheetFileId).toEqual(expect.any(String));

            const read = await call("ana", "GET", "/users/me/avatar");
            expect(read.body).toEqual(saved.body);

            const file = await fetch(
                `${baseUrl}/files/${saved.body.avatarSheetFileId}`
            );
            expect(file.status).toBe(200);
            const bytes = Buffer.from(await file.arrayBuffer());
            expect(bytes.readUInt32BE(16)).toBe(AVATAR_SHEET_PX.w);
            expect(bytes.readUInt32BE(20)).toBe(AVATAR_SHEET_PX.h);
        });

        it("assembles the same bytes for the same choices", async () => {
            const first = await call(
                "bruno",
                "PUT",
                "/users/me/avatar",
                SAVE()
            );
            const second = await call(
                "carla",
                "PUT",
                "/users/me/avatar",
                SAVE()
            );

            const read = async (fileId: string) =>
                Buffer.from(
                    await (
                        await fetch(`${baseUrl}/files/${fileId}`)
                    ).arrayBuffer()
                );
            expect(
                (await read(first.body.avatarSheetFileId)).equals(
                    await read(second.body.avatarSheetFileId)
                )
            ).toBe(true);
            expect((await storedHash(users.bruno.id)).hash).toBe(
                (await storedHash(users.carla.id)).hash
            );
        });

        it("replaces the sheet on a second save and drops the old file", async () => {
            const before = await call("bruno", "GET", "/users/me/avatar");

            const saved = await call("bruno", "PUT", "/users/me/avatar", {
                parts: [{ slot: "TOP", partId: part.top.id }],
            });

            expect(saved.body.avatarSheetFileId).not.toBe(
                before.body.avatarSheetFileId
            );
            expect(saved.body.parts).toEqual([
                { slot: "TOP", partId: part.top.id },
            ]);
            expect(await fileStatus(before.body.avatarSheetFileId)).toBe(404);
            expect(await fileStatus(saved.body.avatarSheetFileId)).toBe(200);
        });

        it("clears the avatar and the sheet row, back to the default base", async () => {
            await call("carla", "PUT", "/users/me/avatar", SAVE());
            const before = await call("carla", "GET", "/users/me/avatar");

            const cleared = await call("carla", "DELETE", "/users/me/avatar");

            expect(cleared.status).toBe(200);
            expect(cleared.body).toEqual({
                baseId: null,
                parts: [],
                avatarSheetFileId: (await defaultBase()).fileId,
            });
            expect(
                (await call("carla", "GET", "/users/me/avatar")).body
            ).toEqual(cleared.body);
            expect(await storedHash(users.carla.id)).toBeUndefined();
            expect(await fileStatus(before.body.avatarSheetFileId)).toBe(404);
        });

        it("treats an empty config as a clear", async () => {
            await call("carla", "PUT", "/users/me/avatar", SAVE());

            const response = await call("carla", "PUT", "/users/me/avatar", {
                parts: [],
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                baseId: null,
                parts: [],
                avatarSheetFileId: (await defaultBase()).fileId,
            });
            expect(await storedHash(users.carla.id)).toBeUndefined();
        });
    });

    describe("base", () => {
        it("keeps only the base when the config has no parts, drawn with its own file", async () => {
            await call("carla", "PUT", "/users/me/avatar", SAVE());

            const response = await call("carla", "PUT", "/users/me/avatar", {
                baseId: base.b.id,
                parts: [],
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                baseId: base.b.id,
                parts: [],
                avatarSheetFileId: base.b.fileId,
            });
            expect(await storedHash(users.carla.id)).toBeUndefined();
            expect(
                (await call("carla", "GET", "/users/me/avatar")).body
            ).toEqual(response.body);
        });

        it("clears the base choice together with everything else", async () => {
            const response = await call("carla", "PUT", "/users/me/avatar", {
                baseId: null,
                parts: [],
            });

            expect(response.body.baseId).toBeNull();
            expect(response.body.avatarSheetFileId).toBe(
                (await defaultBase()).fileId
            );
        });

        it("assembles the parts over the base the person chose", async () => {
            const onA = await call("carla", "PUT", "/users/me/avatar", {
                baseId: base.a.id,
                parts: SAVE().parts,
            });
            const hashOnA = (await storedHash(users.carla.id)).hash;

            const onB = await call("carla", "PUT", "/users/me/avatar", {
                baseId: base.b.id,
                parts: SAVE().parts,
            });

            expect(onA.body.baseId).toBe(base.a.id);
            expect(onB.body.baseId).toBe(base.b.id);
            expect((await storedHash(users.carla.id)).hash).not.toBe(hashOnA);
            expect(onB.body.avatarSheetFileId).not.toBe(
                onA.body.avatarSheetFileId
            );
        });

        it("answers 422 AVATAR_BASE_INVALID for a base that does not exist", async () => {
            const response = await call("carla", "PUT", "/users/me/avatar", {
                baseId: "nope",
                parts: SAVE().parts,
            });

            expect(response.status).toBe(422);
            expect(response.body.code).toBe("AVATAR_BASE_INVALID");
        });

        it("answers 422 AVATAR_BASE_INVALID for a mannequin, with or without parts", async () => {
            for (const parts of [[], SAVE().parts]) {
                const response = await call(
                    "carla",
                    "PUT",
                    "/users/me/avatar",
                    {
                        baseId: base.doll.id,
                        parts,
                    }
                );

                expect(response.status).toBe(422);
                expect(response.body.code).toBe("AVATAR_BASE_INVALID");
            }
        });

        it("leaves the sheets of the people alone when a mannequin sheet is replaced", async () => {
            await call("ana", "PUT", "/users/me/avatar", {
                baseId: base.b.id,
                parts: SAVE().parts,
            });
            const before = await storedHash(users.ana.id);

            await core.AvatarService.replaceBaseSheet(base.doll.id, {
                buffer: sheet(20),
            });

            const after = await storedHash(users.ana.id);
            expect(after.hash).toBe(before.hash);
            expect(after.fileId).toBe(before.fileId);
            expect(await fileStatus(after.fileId)).toBe(200);
        });

        it("assembles again when the sheet of the base is replaced", async () => {
            await call("ana", "PUT", "/users/me/avatar", {
                baseId: base.b.id,
                parts: SAVE().parts,
            });
            const before = await storedHash(users.ana.id);

            await core.AvatarService.replaceBaseSheet(base.b.id, {
                buffer: sheet(10),
            });

            const after = await storedHash(users.ana.id);
            expect(after.hash).not.toBe(before.hash);
            expect(after.fileId).not.toBe(before.fileId);
            expect(await fileStatus(after.fileId)).toBe(200);
            expect(await fileStatus(before.fileId)).toBe(404);
        });
    });

    describe("colors", () => {
        it("picks a color by saving the id of its variation", async () => {
            const black = await call("bruno", "PUT", "/users/me/avatar", {
                parts: [{ slot: "HAIR", partId: part.hair.id }],
            });
            const blackHash = (await storedHash(users.bruno.id)).hash;

            const red = await call("bruno", "PUT", "/users/me/avatar", {
                parts: [{ slot: "HAIR", partId: redHair.id }],
            });

            expect(black.body.parts).toEqual([
                { slot: "HAIR", partId: part.hair.id },
            ]);
            expect(red.status).toBe(200);
            expect(red.body.parts).toEqual([
                { slot: "HAIR", partId: redHair.id },
            ]);
            expect((await storedHash(users.bruno.id)).hash).not.toBe(blackHash);
        });

        it("refuses a variation in the slot of another part", async () => {
            const response = await call("bruno", "PUT", "/users/me/avatar", {
                parts: [{ slot: "HAT", partId: redHair.id }],
            });

            expect(response.status).toBe(422);
            expect(response.body.code).toBe("AVATAR_PART_INVALID");
        });
    });

    describe("validation", () => {
        const put = (parts: unknown[]) =>
            call("ana", "PUT", "/users/me/avatar", { parts });

        it("answers 422 AVATAR_PART_INVALID for a part that does not exist", async () => {
            const response = await put([{ slot: "HAIR", partId: "nope" }]);

            expect(response.status).toBe(422);
            expect(response.body.code).toBe("AVATAR_PART_INVALID");
        });

        it("answers 422 AVATAR_PART_INVALID for a part of another slot", async () => {
            const response = await put([{ slot: "HAT", partId: part.hair.id }]);

            expect(response.status).toBe(422);
            expect(response.body.code).toBe("AVATAR_PART_INVALID");
        });

        it("answers 400 for two entries in the same slot or a malformed body", async () => {
            const twice = await put([
                { slot: "HAIR", partId: part.hair.id },
                { slot: "HAIR", partId: part.hair.id },
            ]);
            const malformed = await call("ana", "PUT", "/users/me/avatar", {
                nope: true,
            });

            expect(twice.status).toBe(400);
            expect(malformed.status).toBe(400);
        });

        it("keeps the saved avatar when a save fails", async () => {
            const before = await call("ana", "GET", "/users/me/avatar");

            await put([{ slot: "HAIR", partId: "nope" }]);

            expect((await call("ana", "GET", "/users/me/avatar")).body).toEqual(
                before.body
            );
        });
    });

    describe("hash and stale sheets", () => {
        it("uses only the costume in the hash, whatever the base and the other choices", async () => {
            const costumeOnly = await call("bruno", "PUT", "/users/me/avatar", {
                baseId: base.a.id,
                parts: [{ slot: "COSTUME", partId: part.costume.id }],
            });
            const onlyHash = (await storedHash(users.bruno.id)).hash;

            const withOthers = await call("bruno", "PUT", "/users/me/avatar", {
                baseId: base.b.id,
                parts: [
                    { slot: "COSTUME", partId: part.costume.id },
                    { slot: "SKIN", partId: part.skin.id },
                ],
            });

            // The costume is the whole sprite, so the base is not drawn.
            expect((await storedHash(users.bruno.id)).hash).toBe(onlyHash);
            expect(withOthers.body.parts).toHaveLength(2);
            expect(withOthers.body.baseId).toBe(base.b.id);
            expect(costumeOnly.status).toBe(200);
        });

        it("assembles the sheet again when the front of a part is swapped", async () => {
            await call("ana", "PUT", "/users/me/avatar", SAVE());
            const before = await storedHash(users.ana.id);

            await core.AvatarService.replaceFront(part.skin.id, {
                buffer: sheet(140),
            });

            const after = await storedHash(users.ana.id);
            expect(after.hash).not.toBe(before.hash);
        });

        it("assembles the sheet again when the front of a color variation is swapped", async () => {
            await call("ana", "PUT", "/users/me/avatar", {
                parts: [{ slot: "HAIR", partId: redHair.id }],
            });
            const before = await storedHash(users.ana.id);

            await core.AvatarService.replaceFront(redHair.id, {
                buffer: sheet(150),
            });

            const after = await storedHash(users.ana.id);
            expect(after.hash).not.toBe(before.hash);
        });

        it("refreshes a stale sheet when asked, and leaves a fresh one alone", async () => {
            await call("ana", "PUT", "/users/me/avatar", SAVE());
            const fresh = await storedHash(users.ana.id);
            expect(
                await core.AvatarService.ensureSheetUpToDate(users.ana.id)
            ).toBe(fresh.fileId);

            const { db, userAvatarSheetsTable, eq } = database;
            await db
                .update(userAvatarSheetsTable)
                .set({ configHash: "stale" })
                .where(eq(userAvatarSheetsTable.userId, users.ana.id));

            const fileId = await core.AvatarService.ensureSheetUpToDate(
                users.ana.id
            );

            expect(fileId).not.toBe(fresh.fileId);
            expect((await storedHash(users.ana.id)).hash).toBe(fresh.hash);
        });

        it("answers the default base for a user without avatar", async () => {
            await call("carla", "DELETE", "/users/me/avatar");

            expect(
                await core.AvatarService.ensureSheetUpToDate(users.carla.id)
            ).toBe((await defaultBase()).fileId);
        });
    });

    describe("sheet change hook", () => {
        it("runs before the old file is deleted and carries the default base on a clear", async () => {
            await call("bruno", "PUT", "/users/me/avatar", SAVE());
            const before = await storedHash(users.bruno.id);
            const seen: {
                change: { userId: string; avatarSheetFileId: string | null };
                oldStatus: number;
            }[] = [];
            const stop = core.AvatarService.onSheetChanged(async (change) => {
                seen.push({
                    change,
                    oldStatus: await fileStatus(before.fileId),
                });
            });

            const saved = await call("bruno", "PUT", "/users/me/avatar", {
                parts: [{ slot: "TOP", partId: part.top.id }],
            });
            await call("bruno", "DELETE", "/users/me/avatar");
            stop();

            expect(seen[0]).toEqual({
                change: {
                    userId: users.bruno.id,
                    avatarSheetFileId: saved.body.avatarSheetFileId,
                },
                oldStatus: 200,
            });
            // The ghost only shows when no base is registered, and one is.
            expect(seen[1].change).toEqual({
                userId: users.bruno.id,
                avatarSheetFileId: (await defaultBase()).fileId,
            });
            expect(await fileStatus(before.fileId)).toBe(404);
        });
    });

    describe("deleted parts", () => {
        it("keep rendering for whoever has them and are refused for others", async () => {
            const deleted = await newPart("Excluída", "GLASSES");
            const config = {
                parts: [{ slot: "GLASSES", partId: deleted.id }],
            };
            expect(
                (await call("ana", "PUT", "/users/me/avatar", config)).status
            ).toBe(200);

            await call(
                "admin",
                "DELETE",
                `/library/avatar-parts/${deleted.id}`
            );

            const same = await call("ana", "PUT", "/users/me/avatar", config);
            expect(same.status).toBe(200);
            expect(same.body.avatarSheetFileId).toEqual(expect.any(String));

            const other = await call(
                "carla",
                "PUT",
                "/users/me/avatar",
                config
            );
            expect(other.status).toBe(422);
            expect(other.body.code).toBe("AVATAR_PART_INVALID");

            const editor = await call("ana", "GET", "/avatar/editor");
            expect(
                (editor.body.current.parts as Json[]).some(
                    ({ partId }) => partId === deleted.id
                )
            ).toBe(true);

            const listed = await call(
                "ana",
                "GET",
                `/avatar/categories/GLASSES/parts?limit=${AVATAR_PARTS_PAGE.max}`
            );
            expect(
                (listed.body.items as Json[]).some(
                    ({ id }) => id === deleted.id
                )
            ).toBe(false);
        });
    });

    describe("new users", () => {
        it("get a random avatar when the catalog has parts", async () => {
            const created = await core.UserService.create({
                name: "Nova Pessoa",
                email: `nova-${RUN}@avatar.dev`,
                password: "Senha-Forte-123!",
            });

            const avatar = await core.AvatarService.getUserAvatar(created.id);

            expect(avatar.avatarSheetFileId).toEqual(expect.any(String));
            expect(avatar.parts.length).toBeGreaterThan(0);
        });
    });
});
