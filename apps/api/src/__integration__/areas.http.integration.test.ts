import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Stamp } from "@standin/contracts";
import { publishOps } from "./helpers/publishOps";

// Exercises the area routes over the real Express stack (auth, admin guard,
// multer, controllers, error mapping) against a real Postgres. Off unless
// INTEGRATION_DATABASE_URL points at a throwaway database different from the
// app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "owner" | "outsider";
type Json = any;

describe.skipIf(!enabled)("areas over HTTP (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    let organizationId: string;
    let space: { id: string; mapId: string };
    let template: { id: string; mapId: string };
    let floorTilesetId: string;
    let floorTileIndex: number;
    let deskId: string;
    let orgDeskId: string;
    let retiredDeskId: string;

    const call = async (
        as: UserKey | null,
        method: string,
        route: string,
        body?: unknown,
        raw?: FormData,
        extraHeaders: Record<string, string> = {}
    ) => {
        const headers: Record<string, string> = { ...extraHeaders };
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
        return {
            status: response.status,
            body: json,
            headers: response.headers,
        };
    };

    const png = (width: number, height: number) =>
        core.encodePng(
            width,
            height,
            Array.from({ length: width * height }, () => [5, 5, 5, 255])
        );

    type Parts = { image?: Buffer; data?: unknown };
    const form = ({ image, data }: Parts) => {
        const body = new FormData();
        if (image) {
            body.append(
                "image",
                new Blob([new Uint8Array(image)], { type: "image/png" }),
                "image.png"
            );
        }
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

    const codes = (response: { body: Json }) =>
        (response.body.errors as { code: string }[]).map(({ code }) => code);

    // 4 x 3 tiles of floor and a desk (2 x 1) on the second row.
    const buildStamp = (overrides: Partial<Stamp> = {}): Stamp => ({
        version: 1,
        width: 4,
        height: 3,
        palette: [{ tilesetId: floorTilesetId, tileIndex: floorTileIndex }],
        layers: { ground: Array.from({ length: 12 }, () => 1) },
        objects: [
            {
                assetId: deskId,
                dx: 0,
                dy: 1,
                offsetX: 0,
                offsetY: 0,
                parentIndex: null,
            },
        ],
        zone: { label: "Sala" },
        ...overrides,
    });
    const upload = (stamp: Stamp, name = "Sala de reunião", w = 4, h = 3) => ({
        image: png(w * 32, h * 32),
        data: { name, stamp },
    });
    const createArea = async (name = `Sala ${RUN}`) => {
        const response = await send(
            "admin",
            "POST",
            "/library/areas",
            upload(buildStamp(), name)
        );
        expect(response.status).toBe(201);
        return response.body.area as { id: string; updatedAt: number };
    };

    const libraryOf = (as: UserKey, mapId: string) =>
        call(as, "GET", `/maps/${mapId}/library`);

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

        const { db, usersTable, tilesetsTable, assetsTable, isNull, eq } =
            database;
        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@areas.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await make("outsider", "USER");

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Areas Org" }
        );
        organizationId = organization.id;

        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: users.admin.id }
        );
        const tilesets = await db
            .select()
            .from(tilesetsTable)
            .where(isNull(tilesetsTable.organizationId));
        const floors = tilesets.find(({ key }) => key === "floors")!;
        floorTilesetId = floors.id;
        floorTileIndex = Number(
            Object.entries(floors.tileMeta ?? {}).find(
                ([, meta]) => meta.category === "FLOOR"
            )![0]
        );

        const makeDesk = async (key: string, scope: string | null) =>
            (
                await core.AssetService.createAsset(
                    { buffer: png(64, 32) },
                    {
                        key: `${key}-${RUN}`,
                        name: key,
                        type: "DESK",
                        category: "ROOM_DECOR",
                        footprint: { w: 2, h: 1 },
                        solid: true,
                    },
                    { organizationId: scope, createdBy: users.admin.id }
                )
            ).id;
        deskId = await makeDesk("desk", null);
        orgDeskId = await makeDesk("org-desk", organizationId);
        retiredDeskId = await makeDesk("retired-desk", null);
        await db
            .update(assetsTable)
            .set({ deletedAt: new Date() })
            .where(eq(assetsTable.id, retiredDeskId));

        const created = await core.SpaceService.create(
            organizationId,
            users.owner.id,
            { name: "Sala", sizeTier: "XS" }
        );
        space = { id: created.id, mapId: created.mapId };
        const tpl = await core.MapTemplateService.create(users.admin.id, {
            name: `Tpl ${RUN}`,
            sizeTier: "S",
        });
        template = { id: tpl.id, mapId: tpl.mapId };

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
        it("lets only the admin create, list, read, replace, rename and delete", async () => {
            const area = await createArea();
            const route = `/library/areas/${area.id}`;
            const parts = upload(buildStamp());

            for (const as of ["owner", "outsider"] as const) {
                expect(
                    (await send(as, "POST", "/library/areas", parts)).status
                ).toBe(403);
                expect((await call(as, "GET", "/library/areas")).status).toBe(
                    403
                );
                expect((await call(as, "GET", route)).status).toBe(403);
                expect((await send(as, "PUT", route, parts)).status).toBe(403);
                expect(
                    (await call(as, "PATCH", route, { name: "X" })).status
                ).toBe(403);
                expect((await call(as, "DELETE", route)).status).toBe(403);
            }
            expect(
                (await send(null, "POST", "/library/areas", parts)).status
            ).toBe(401);
        });
    });

    describe("create", () => {
        it("stores the area and answers the summary with the stamp", async () => {
            const response = await send(
                "admin",
                "POST",
                "/library/areas",
                upload(buildStamp(), "Mesa privada")
            );

            expect(response.status).toBe(201);
            expect(response.body.area).toMatchObject({
                name: "Mesa privada",
                width: 4,
                height: 3,
                objectCount: 1,
                createdBy: "admin",
            });
            expect(response.body.area.thumbnailUrl).toMatch(/^\/files\//);
            expect(response.body.area.stamp.zone).toEqual({ label: "Sala" });
        });

        it("refuses a thumbnail whose size is not the stamp size times 32", async () => {
            const response = await send(
                "admin",
                "POST",
                "/library/areas",
                upload(buildStamp(), "Pequena", 2, 2)
            );

            expect(response.status).toBe(422);
            expect(codes(response)).toEqual(["THUMBNAIL_SIZE_MISMATCH"]);
        });

        it("refuses an empty, a blank and a too long name", async () => {
            for (const name of ["", "   ", "a".repeat(61)]) {
                const response = await send(
                    "admin",
                    "POST",
                    "/library/areas",
                    upload(buildStamp(), name)
                );
                expect(response.status).toBe(422);
                expect(codes(response)).toEqual(["AREA_NAME_INVALID"]);
            }
        });

        it("refuses a stamp that breaks the schema or the placement rules", async () => {
            const shortLayer = await send(
                "admin",
                "POST",
                "/library/areas",
                upload(buildStamp({ layers: { ground: [1, 1] } }))
            );
            expect(shortLayer.status).toBe(422);
            expect(codes(shortLayer).length).toBeGreaterThan(0);

            const parent = await send(
                "admin",
                "POST",
                "/library/areas",
                upload(
                    buildStamp({
                        objects: [
                            {
                                assetId: deskId,
                                dx: 0,
                                dy: 1,
                                offsetX: 0,
                                offsetY: 0,
                                parentIndex: 0,
                            },
                        ],
                    })
                )
            );
            expect(parent.status).toBe(422);

            const empty = await send(
                "admin",
                "POST",
                "/library/areas",
                upload(buildStamp({ layers: {}, objects: [] }))
            );
            expect(empty.status).toBe(422);
            expect(codes(empty)).toEqual(["STAMP_EMPTY"]);
        });

        it("refuses a retired asset, an organization asset and an unknown tileset", async () => {
            const object = (assetId: string) => ({
                assetId,
                dx: 0,
                dy: 1,
                offsetX: 0,
                offsetY: 0,
                parentIndex: null,
            });
            for (const assetId of [retiredDeskId, orgDeskId]) {
                const response = await send(
                    "admin",
                    "POST",
                    "/library/areas",
                    upload(buildStamp({ objects: [object(assetId)] }))
                );
                expect(response.status).toBe(422);
                expect(codes(response)).toEqual(["STAMP_ASSET_UNAVAILABLE"]);
            }

            const tileset = await send(
                "admin",
                "POST",
                "/library/areas",
                upload(
                    buildStamp({
                        palette: [{ tilesetId: "missing", tileIndex: 0 }],
                    })
                )
            );
            expect(tileset.status).toBe(422);
            expect(codes(tileset)).toEqual(["STAMP_TILESET_UNAVAILABLE"]);
        });

        it("answers every problem together and stores nothing", async () => {
            const before = await call("admin", "GET", "/library/areas");
            const response = await send(
                "admin",
                "POST",
                "/library/areas",
                upload(buildStamp(), "", 2, 2)
            );

            expect(response.status).toBe(422);
            expect(codes(response).sort()).toEqual([
                "AREA_NAME_INVALID",
                "THUMBNAIL_SIZE_MISMATCH",
            ]);
            const after = await call("admin", "GET", "/library/areas");
            expect(after.body.total).toBe(before.body.total);
        });

        it("answers 413 for a PNG above the byte limit and 422 without parts", async () => {
            const big = await send("admin", "POST", "/library/areas", {
                image: Buffer.alloc(3 * 1024 * 1024 + 1),
                data: { name: "Grande", stamp: buildStamp() },
            });
            expect(big.status).toBe(413);

            const none = await send("admin", "POST", "/library/areas", {});
            expect(none.status).toBe(422);
            expect(codes(none)).toContain("IMAGE_FILE_REQUIRED");
        });
    });

    describe("list and details", () => {
        it("searches by name without accent and without case, on the server", async () => {
            const name = `Reunião Ágil ${RUN}`;
            await createArea(name);

            for (const search of ["reuniao agil", "REUNIÃO ÁGIL", "ágil"]) {
                const response = await call(
                    "admin",
                    "GET",
                    `/library/areas?search=${encodeURIComponent(`${search}`)}`
                );
                expect(response.status).toBe(200);
                expect(
                    response.body.areas.map((a: { name: string }) => a.name)
                ).toContain(name);
            }
            const none = await call(
                "admin",
                "GET",
                `/library/areas?search=${encodeURIComponent("zzz-nada")}`
            );
            expect(none.body).toEqual({ areas: [], total: 0 });
        });

        it("lists the newest first and returns the stamp only in the details", async () => {
            const first = await createArea(`Primeira ${RUN}`);
            const second = await createArea(`Segunda ${RUN}`);

            const list = await call("admin", "GET", "/library/areas");
            const ids = list.body.areas.map((a: { id: string }) => a.id);
            expect(ids.indexOf(second.id)).toBeLessThan(ids.indexOf(first.id));
            expect(list.body.areas[0].stamp).toBeUndefined();

            const details = await call(
                "admin",
                "GET",
                `/library/areas/${first.id}`
            );
            expect(details.body.area.stamp.width).toBe(4);
            expect(
                (await call("admin", "GET", "/library/areas/nope")).status
            ).toBe(404);
        });
    });

    describe("replace, rename and delete", () => {
        it("replaces the content, moves the version and soft deletes the old thumbnail", async () => {
            const area = await createArea();
            const before = (
                await call("admin", "GET", `/library/areas/${area.id}`)
            ).body.area;
            const { db, filesTable, eq } = database;
            await new Promise((resolve) => setTimeout(resolve, 5));

            const stamp = buildStamp({
                objects: [],
                zone: null,
            });
            const response = await send(
                "admin",
                "PUT",
                `/library/areas/${area.id}`,
                upload(stamp, "Nova versão")
            );

            expect(response.status).toBe(200);
            expect(response.body.area).toMatchObject({
                name: "Nova versão",
                objectCount: 0,
            });
            expect(response.body.area.updatedAt).toBeGreaterThan(
                before.updatedAt
            );
            expect(response.body.area.thumbnailUrl).not.toBe(
                before.thumbnailUrl
            );

            const oldId = before.thumbnailUrl.replace("/files/", "");
            const [old] = await db
                .select()
                .from(filesTable)
                .where(eq(filesTable.id, oldId));
            expect(old!.deletedAt).not.toBeNull();
        });

        it("refuses a size change and an unknown area", async () => {
            const area = await createArea();
            const bigger = buildStamp({
                width: 5,
                layers: { ground: Array.from({ length: 15 }, () => 1) },
                objects: [],
            });

            const resized = await send(
                "admin",
                "PUT",
                `/library/areas/${area.id}`,
                upload(bigger, "Maior", 5, 3)
            );
            expect(resized.status).toBe(422);
            expect(codes(resized)).toEqual(["AREA_SIZE_IMMUTABLE"]);

            const missing = await send(
                "admin",
                "PUT",
                "/library/areas/nope",
                upload(buildStamp())
            );
            expect(missing.status).toBe(404);
            expect(missing.body.code).toBe("AREA_NOT_FOUND");
        });

        it("renames, moving the version and the palette ETag, and keeps the stamp", async () => {
            const area = await createArea();
            const first = await libraryOf("owner", space.mapId);
            const etag = first.headers.get("etag")!;

            await new Promise((resolve) => setTimeout(resolve, 5));
            const renamed = await call(
                "admin",
                "PATCH",
                `/library/areas/${area.id}`,
                { name: "Renomeada" }
            );

            expect(renamed.status).toBe(200);
            expect(renamed.body.area.name).toBe("Renomeada");
            expect(renamed.body.area.updatedAt).toBeGreaterThan(area.updatedAt);

            const stale = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/library`,
                undefined,
                undefined,
                { "if-none-match": etag }
            );
            expect(stale.status).toBe(200);
            expect(stale.headers.get("etag")).not.toBe(etag);

            const invalid = await call(
                "admin",
                "PATCH",
                `/library/areas/${area.id}`,
                { name: "" }
            );
            expect(invalid.status).toBe(422);
            expect(codes(invalid)).toEqual(["AREA_NAME_INVALID"]);
        });

        it("soft deletes: gone from the list, details, palette and map route, ETag moved", async () => {
            const area = await createArea();
            const etag = (await libraryOf("owner", space.mapId)).headers.get(
                "etag"
            )!;

            const removed = await call(
                "admin",
                "DELETE",
                `/library/areas/${area.id}`
            );
            expect(removed.status).toBe(204);

            const { db, areasTable, eq } = database;
            const [row] = await db
                .select()
                .from(areasTable)
                .where(eq(areasTable.id, area.id));
            expect(row!.deletedAt).not.toBeNull();

            expect(
                (await call("admin", "GET", `/library/areas/${area.id}`)).status
            ).toBe(404);
            expect(
                (await call("admin", "DELETE", `/library/areas/${area.id}`))
                    .status
            ).toBe(404);
            expect(
                (
                    await call(
                        "owner",
                        "GET",
                        `/maps/${space.mapId}/areas/${area.id}`
                    )
                ).status
            ).toBe(404);

            const after = await libraryOf("owner", space.mapId);
            expect(after.headers.get("etag")).not.toBe(etag);
            expect(
                after.body.library.areas.map((a: { id: string }) => a.id)
            ).not.toContain(area.id);
        });
    });

    describe("palette", () => {
        it("serves the global areas to the composer and to maps, with the version in ms", async () => {
            const area = await createArea(`Paleta ${RUN}`);

            const global = await call("admin", "GET", "/library/palette");
            expect(global.status).toBe(200);
            const entry = global.body.library.areas.find(
                (a: { id: string }) => a.id === area.id
            );
            expect(entry).toMatchObject({
                name: `Paleta ${RUN}`,
                width: 4,
                height: 3,
                objectCount: 1,
                version: area.updatedAt,
            });
            expect(entry.stamp).toBeUndefined();

            for (const mapId of [space.mapId, template.mapId]) {
                const response = await libraryOf(
                    mapId === space.mapId ? "owner" : "admin",
                    mapId
                );
                expect(
                    response.body.library.areas.map((a: { id: string }) => a.id)
                ).toContain(area.id);
            }
        });

        it("shows an organization area to its space and hides it from a template", async () => {
            const { db, areasTable } = database;
            const source = await createArea(`Fonte ${RUN}`);
            const detail = (
                await call("admin", "GET", `/library/areas/${source.id}`)
            ).body.area;
            const [own] = await db
                .insert(areasTable)
                .values({
                    organizationId,
                    name: `Da organização ${RUN}`,
                    width: 4,
                    height: 3,
                    objectCount: 1,
                    stamp: detail.stamp,
                    thumbnailFileId: detail.thumbnailUrl.replace("/files/", ""),
                    createdBy: users.admin.id,
                })
                .returning({ id: areasTable.id });

            const inSpace = await libraryOf("owner", space.mapId);
            const inTemplate = await libraryOf("admin", template.mapId);
            const ids = (response: { body: Json }) =>
                response.body.library.areas.map((a: { id: string }) => a.id);
            expect(ids(inSpace)).toContain(own!.id);
            expect(ids(inTemplate)).not.toContain(own!.id);

            const read = (as: UserKey, mapId: string) =>
                call(
                    "admin" === as ? "admin" : as,
                    "GET",
                    `/maps/${mapId}/areas/${own!.id}`
                );
            expect((await read("owner", space.mapId)).status).toBe(200);
            expect((await read("admin", template.mapId)).status).toBe(404);
        });

        it("keeps the 304 while nothing changes and moves it on create", async () => {
            const first = await libraryOf("owner", space.mapId);
            const etag = first.headers.get("etag")!;
            const same = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/library`,
                undefined,
                undefined,
                { "if-none-match": etag }
            );
            expect(same.status).toBe(304);

            await createArea();
            const changed = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/library`,
                undefined,
                undefined,
                { "if-none-match": etag }
            );
            expect(changed.status).toBe(200);
        });
    });

    describe("GET /maps/:mapId/areas/:areaId", () => {
        it("answers the stamp with the immutable cache header", async () => {
            const area = await createArea();
            const response = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/areas/${area.id}?v=${area.updatedAt}`
            );

            expect(response.status).toBe(200);
            expect(response.headers.get("cache-control")).toBe(
                "private, max-age=31536000, immutable"
            );
            expect(response.body.area).toMatchObject({
                id: area.id,
                version: area.updatedAt,
            });
            expect(response.body.area.stamp.width).toBe(4);
        });

        it("answers 401 without a login, 404 to a stranger and 404 for an unknown area", async () => {
            const area = await createArea();
            const route = `/maps/${space.mapId}/areas/${area.id}`;

            expect((await call(null, "GET", route)).status).toBe(401);
            expect((await call("outsider", "GET", route)).status).toBe(404);
            expect(
                (await call("owner", "GET", `/maps/${space.mapId}/areas/nope`))
                    .status
            ).toBe(404);
        });
    });

    describe("placed areas are copies", () => {
        it("accepts paint_tiles in a publish, and a later replace or delete does not change the map", async () => {
            const area = await createArea();
            const access = await core.MapService.getAccess(
                users.admin,
                template.mapId
            );
            const render = async () =>
                (await call("admin", "GET", `/maps/${template.mapId}/render`))
                    .body;

            await publishOps(
                core,
                { id: users.admin.id, name: "admin" },
                access,
                1,
                [
                    {
                        type: "paint_tiles",
                        layer: "ground",
                        tiles: [
                            {
                                tilesetId: floorTilesetId,
                                tileIndex: floorTileIndex,
                                cells: [
                                    [0, 0],
                                    [1, 0],
                                ],
                            },
                        ],
                    },
                ]
            );
            const placed = await render();

            await send(
                "admin",
                "PUT",
                `/library/areas/${area.id}`,
                upload(buildStamp({ objects: [], zone: null }), "Editada")
            );
            await call("admin", "DELETE", `/library/areas/${area.id}`);

            expect(await render()).toEqual(placed);
        });

        it("refuses a paint_tiles above the cell limit of one operation", async () => {
            core.MapLockService.acquire(
                template.mapId,
                { id: users.admin.id, name: "admin" },
                "areas-limit"
            );
            const cells = Array.from({ length: 2501 }, (_, i) => [i % 50, 0]);
            const response = await call(
                "admin",
                "POST",
                `/maps/${template.mapId}/publish`,
                {
                    publishId: crypto.randomUUID(),
                    baseVersion: 2,
                    ops: [
                        {
                            type: "paint_tiles",
                            layer: "ground",
                            tiles: [
                                {
                                    tilesetId: floorTilesetId,
                                    tileIndex: floorTileIndex,
                                    cells,
                                },
                            ],
                        },
                    ],
                },
                undefined,
                { "x-editor-session": "areas-limit" }
            );
            core.MapLockService.release(template.mapId, "areas-limit");
            expect(response.status).toBe(400);
        });
    });
});
