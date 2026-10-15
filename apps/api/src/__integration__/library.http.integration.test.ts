import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { expandTileMask } from "@standin/contracts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { publishOps } from "./helpers/publishOps";

// Exercises the asset library over the real Express stack (auth, admin guard,
// multer, controllers, error mapping) against a real Postgres. Off unless
// INTEGRATION_DATABASE_URL points at a throwaway database different from the
// app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Database = typeof import("@standin/database");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "owner" | "member" | "outsider";
type Json = any;

const COLORS = {
    red: { key: "red", hex: "#D64545" },
    blue: { key: "blue", hex: "#3F6FD1" },
    green: { key: "green", hex: "#3FA55B" },
};

describe.skipIf(!enabled)("asset library over HTTP (real stack)", () => {
    let core: Core;
    let database: Database;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    // Shared by the integration files: they share the database, and so the
    // global library whose files this directory holds.
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    let organizationId: string;
    let space: { id: string; mapId: string };
    let template: { id: string; mapId: string };

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

    type Parts = {
        image?: Buffer;
        data?: unknown;
        // Sends the JSON part as a text field instead of a file part.
        asField?: boolean;
    };
    const form = ({ image, data, asField }: Parts) => {
        const body = new FormData();
        if (image) {
            body.append(
                "image",
                new Blob([new Uint8Array(image)], { type: "image/png" }),
                "image.png"
            );
        }
        if (data !== undefined) {
            const text = typeof data === "string" ? data : JSON.stringify(data);
            if (asField) body.append("data", text);
            else
                body.append(
                    "data",
                    new Blob([text], { type: "application/json" }),
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

    const createTileset = (parts: Parts, as: UserKey | null = "admin") =>
        send(as, "POST", "/library/tilesets", parts);
    const createAsset = (parts: Parts, as: UserKey | null = "admin") =>
        send(as, "POST", "/library/assets", parts);
    const createVariant = (baseId: string, parts: Parts) =>
        send("admin", "POST", `/library/assets/${baseId}/variants`, parts);

    const codes = (response: { body: Json }) =>
        (response.body.errors as { code: string }[]).map(({ code }) => code);

    const mug = (key: string, extra: Record<string, unknown> = {}) => ({
        key,
        name: "Caneca",
        type: "DECORATION",
        category: "FOOD_DRINK",
        placement: "SURFACE",
        footprint: { w: 1, h: 1 },
        color: COLORS.red,
        ...extra,
    });

    const strip = (frames: number) => png(32 * frames, 64);

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

        const { db, usersTable, organizationMembersTable } = database;
        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@library.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await make("member", "USER");
        await make("outsider", "USER");

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Library Org" }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values({
            userId: users.member.id,
            organizationId,
            role: "MEMBER",
        });

        // Only the tilesets: this file creates its own pieces.
        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: users.admin.id }
        );

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
        it("lets only the admin create in the global library", async () => {
            const parts = {
                image: png(32, 32),
                data: mug(`who-${RUN}`),
            };

            expect((await createAsset(parts, null)).status).toBe(401);
            for (const as of ["member", "owner", "outsider"] as const) {
                expect((await createAsset(parts, as)).status).toBe(403);
                expect(
                    (await call(as, "GET", "/library/tilesets")).status
                ).toBe(403);
            }
            expect((await createAsset(parts)).status).toBe(201);
        });

        it("answers 403 SCOPE_FORBIDDEN for an organizationId, in the query or in data", async () => {
            const query = await call(
                "admin",
                "GET",
                `/library/tilesets?organizationId=${organizationId}`
            );
            expect(query.status).toBe(403);
            expect(query.body.code).toBe("SCOPE_FORBIDDEN");

            const data = await createAsset({
                image: png(32, 32),
                data: mug(`org-${RUN}`, { organizationId }),
            });
            expect(data.status).toBe(403);
            expect(data.body.code).toBe("SCOPE_FORBIDDEN");
        });
    });

    describe("library of an organization", () => {
        const orgRoute = (path: string) =>
            `/organizations/${organizationId}/library${path}`;

        it("lets only the owner of the organization write in it", async () => {
            const parts = () => ({
                image: png(32, 32),
                data: mug(`org-owner-${RUN}`),
            });

            expect(
                (await send(null, "POST", orgRoute("/assets"), parts())).status
            ).toBe(401);
            for (const as of ["member", "outsider", "admin"] as const) {
                expect(
                    (await send(as, "POST", orgRoute("/assets"), parts()))
                        .status
                ).toBe(403);
                expect(
                    (await call(as, "GET", orgRoute("/assets"))).status
                ).toBe(403);
            }

            const created = await send(
                "owner",
                "POST",
                orgRoute("/assets"),
                parts()
            );
            expect(created.status).toBe(201);
        });

        it("keeps the two libraries apart", async () => {
            const orgKey = `org-apart-${RUN}`;
            const globalKey = `global-apart-${RUN}`;
            const orgAsset = await send("owner", "POST", orgRoute("/assets"), {
                image: png(32, 32),
                data: mug(orgKey),
            });
            const globalAsset = await createAsset({
                image: png(32, 32),
                data: mug(globalKey),
            });
            const orgId = orgAsset.body.asset.id as string;
            const globalId = globalAsset.body.asset.id as string;

            // The owner never reaches the global row, in any verb.
            expect(
                (await call("owner", "GET", orgRoute(`/assets/${globalId}`)))
                    .status
            ).toBe(404);
            expect(
                (
                    await call(
                        "owner",
                        "DELETE",
                        orgRoute(`/assets/${globalId}`)
                    )
                ).status
            ).toBe(404);
            // Nor the admin reaches the row of the organization.
            expect(
                (await call("admin", "GET", `/library/assets/${orgId}`)).status
            ).toBe(404);

            expect(
                (await call("owner", "GET", orgRoute(`/assets/${orgId}`)))
                    .status
            ).toBe(200);
        });

        it("refuses an organizationId in data even for the owner", async () => {
            const response = await send("owner", "POST", orgRoute("/assets"), {
                image: png(32, 32),
                data: mug(`org-body-${RUN}`, { organizationId }),
            });
            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SCOPE_FORBIDDEN");
        });
    });

    describe("uploads", () => {
        it("accepts the data part as a plain form field", async () => {
            const response = await createAsset({
                image: png(32, 32),
                data: mug(`field-${RUN}`),
                asField: true,
            });

            expect(response.status).toBe(201);
        });

        it("lists every problem at once with code, path and message", async () => {
            const response = await createAsset({
                image: Buffer.from("this is text pretending to be image.png"),
                data: { name: "", type: "NOPE", footprint: { w: 0, h: 0 } },
            });

            expect(response.status).toBe(422);
            expect(response.body.warnings).toEqual([]);
            expect(codes(response)).toContain("DATA_INVALID");
            for (const error of response.body.errors) {
                expect(error).toEqual({
                    code: expect.any(String),
                    path: expect.any(String),
                    message: expect.any(String),
                });
            }
        });

        it("refuses a missing image and a data part that is not JSON", async () => {
            const noImage = await createAsset({ data: mug(`noimg-${RUN}`) });
            expect(noImage.status).toBe(422);
            expect(codes(noImage)).toContain("IMAGE_FILE_REQUIRED");

            const broken = await createAsset({
                image: png(32, 32),
                data: "{not json",
            });
            expect(broken.status).toBe(422);
            expect(codes(broken)).toContain("DATA_INVALID");
        });

        it("reads the PNG from its bytes, not from the name or the mime type", async () => {
            const response = await createAsset({
                image: Buffer.from("GIF89a-not-a-png-but-long-enough-to-pass"),
                data: mug(`gif-${RUN}`),
            });

            expect(response.status).toBe(422);
            expect(codes(response)).toEqual(["PNG_INVALID"]);
        });

        it("answers 413 above the byte limit and 422 above the pixel limit", async () => {
            const big = await createAsset({
                image: Buffer.alloc(3 * 1024 * 1024 + 1),
                data: mug(`big-${RUN}`),
            });
            expect(big.status).toBe(413);
            expect(big.body.code).toBe("PNG_TOO_LARGE");

            const wide = Buffer.from(png(32, 32));
            wide.writeUInt32BE(4097, 16);
            const dimensions = await createAsset({
                image: wide,
                data: mug(`wide-${RUN}`),
            });
            expect(dimensions.status).toBe(422);
            expect(codes(dimensions)).toEqual(["PNG_DIMENSIONS_EXCEEDED"]);
        });
    });

    describe("tilesets", () => {
        it("creates one, computes the grid and refuses a sheet off the 32 px grid", async () => {
            const key = `tiles-${RUN}`;
            const created = await createTileset({
                image: png(128, 64),
                data: {
                    key,
                    name: "Azulejos",
                    tileMeta: { "0": { category: "FLOOR" } },
                },
            });

            expect(created.status).toBe(201);
            expect(created.body.tileset).toMatchObject({
                key,
                widthPx: 128,
                heightPx: 64,
                columns: 4,
                tileCount: 8,
                inUse: false,
            });

            const off = await createTileset({
                image: png(100, 64),
                data: { name: "Torto" },
            });
            expect(off.status).toBe(422);
            expect(codes(off)).toEqual(["GRID_MISMATCH"]);

            const taken = await createTileset({
                image: png(32, 32),
                data: { key, name: "Repetido" },
            });
            expect(taken.status).toBe(409);
            expect(taken.body.code).toBe("TILESET_KEY_TAKEN");
        });

        it("validates tileMeta against the tile count and the single blankDefault", async () => {
            const outOfRange = await createTileset({
                image: png(64, 32),
                data: {
                    name: "Curto",
                    tileMeta: { "5": { category: "FLOOR" } },
                },
            });
            expect(outOfRange.status).toBe(422);
            expect(codes(outOfRange)).toEqual(["TILE_META_OUT_OF_RANGE"]);

            // The seed already holds the default floor.
            const second = await createTileset({
                image: png(64, 32),
                data: {
                    name: "Outro piso",
                    tileMeta: {
                        "0": { category: "FLOOR", blankDefault: true },
                    },
                },
            });
            expect(second.status).toBe(422);
            expect(codes(second)).toEqual(["BLANK_DEFAULT_DUPLICATED"]);
        });

        it("renames, lists, and deletes without breaking the maps that paint with it", async () => {
            const created = await createTileset({
                image: png(96, 32),
                data: {
                    name: "Para pintar",
                    tileMeta: { "1": { category: "FLOOR" } },
                },
            });
            const id = created.body.tileset.id as string;

            const renamed = await call(
                "admin",
                "PATCH",
                `/library/tilesets/${id}`,
                { name: "Pintura" }
            );
            expect(renamed.body.tileset.name).toBe("Pintura");

            // Paints the owner's space with it, so it becomes in use.
            const access = await core.MapService.getAccess(
                users.owner,
                space.mapId
            );
            await publishOps(
                core,
                { id: users.owner.id, name: "owner" },
                access,
                1,
                [
                    {
                        type: "paint",
                        layer: "ground",
                        tilesetId: id,
                        tileIndex: 1,
                        cells: [[3, 3]],
                    },
                ]
            );

            const detail = await call(
                "admin",
                "GET",
                `/library/tilesets/${id}`
            );
            expect(detail.body.tileset.inUse).toBe(true);

            // In use: only new entries, no change to an existing one.
            const put = (tileMeta: unknown) =>
                call("admin", "PUT", `/library/tilesets/${id}/tile-meta`, {
                    tileMeta,
                });
            const base = { "1": { category: "FLOOR" } };
            expect(
                (await put({ ...base, "0": { category: "FLOOR" } })).status
            ).toBe(200);
            const changed = await put({
                ...base,
                "0": { category: "WALL" },
            });
            expect(changed.status).toBe(409);
            expect(changed.body.code).toBe("TILESET_IN_USE");
            expect(
                (
                    await put({
                        ...base,
                        "0": { category: "FLOOR" },
                        "2": { category: "FLOOR" },
                    })
                ).status
            ).toBe(200);

            // A map paints with it, so it is only soft deleted.
            const removed = await call(
                "admin",
                "DELETE",
                `/library/tilesets/${id}`
            );
            expect(removed.status).toBe(200);
            expect(removed.body.deleted).toBe(false);
            const list = await call("admin", "GET", "/library/tilesets");
            expect(
                list.body.tilesets.some(
                    (item: { id: string }) => item.id === id
                )
            ).toBe(false);

            // The map still renders it.
            const render = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/render`
            );
            expect(
                render.body.tilesets.some(
                    (item: { id: string }) => item.id === id
                )
            ).toBe(true);
        });

        it("deletes for good a tileset that no map paints with", async () => {
            const created = await createTileset({
                image: png(64, 32),
                data: { name: "Sem uso" },
            });
            const id = created.body.tileset.id as string;
            expect(created.body.tileset.taggedCount).toBe(0);

            const removed = await call(
                "admin",
                "DELETE",
                `/library/tilesets/${id}`
            );
            expect(removed.status).toBe(200);
            expect(removed.body.deleted).toBe(true);
            expect(
                (await call("admin", "GET", `/library/tilesets/${id}`)).status
            ).toBe(404);
        });
    });

    describe("assets and families", () => {
        it("creates a static base with the frame read from the PNG", async () => {
            const response = await createAsset({
                image: png(32, 64),
                data: mug(`static-${RUN}`, {
                    footprint: { w: 1, h: 2 },
                    placement: "GROUND",
                }),
            });

            expect(response.status).toBe(201);
            expect(response.body.asset).toMatchObject({
                key: `static-${RUN}`,
                baseAssetId: null,
                sprite: { w: 32, h: 64 },
                footprint: { w: 1, h: 2, offsetX: 0 },
                animation: null,
                colorKey: "red",
                inUse: false,
                parts: [],
            });
            expect(response.body.asset.url).toMatch(/^\/files\/[\w-]+$/);
        });

        it("stores the footprint mask and returns it in the asset", async () => {
            // Four cells per tile per side, the bottom right tile left free.
            const mask = expandTileMask([
                [true, true],
                [true, false],
            ]);
            const response = await createAsset({
                image: png(64, 64),
                data: mug(`masked-${RUN}`, {
                    type: "DESK",
                    category: "TABLES",
                    placement: "GROUND",
                    footprint: { w: 2, h: 2, mask },
                }),
            });

            expect(response.status).toBe(201);
            expect(response.body.asset.footprint).toEqual({
                w: 2,
                h: 2,
                offsetX: 0,
                mask,
                solidMask: null,
            });
        });

        it("stores the collision mask and returns it with the footprint whole", async () => {
            // One tile wide and two high: only the top tile has solid cells.
            const solidMask = Array.from({ length: 8 }, (_, row) =>
                Array.from({ length: 4 }, (_, column) => row < 4 && column < 2)
            );
            const response = await createAsset({
                image: png(32, 64),
                data: mug(`solidmask-${RUN}`, {
                    type: "DESK",
                    category: "TABLES",
                    placement: "GROUND",
                    solid: true,
                    footprint: { w: 1, h: 2, solidMask },
                }),
            });

            expect(response.status).toBe(201);
            expect(response.body.asset.footprint).toEqual({
                w: 1,
                h: 2,
                offsetX: 0,
                mask: null,
                solidMask,
            });
        });

        it("refuses a collision mask that does not fit, or on a free tile", async () => {
            const wrongShape = await createAsset({
                image: png(32, 32),
                data: mug(`solidshape-${RUN}`, {
                    placement: "GROUND",
                    footprint: { w: 1, h: 1, solidMask: [[true]] },
                }),
            });
            expect(wrongShape.status).toBe(422);

            const solidOnFreeTile = await createAsset({
                image: png(64, 32),
                data: mug(`solidfree-${RUN}`, {
                    placement: "GROUND",
                    footprint: {
                        w: 2,
                        h: 1,
                        mask: expandTileMask([[true, false]]),
                        solidMask: Array.from({ length: 4 }, () => [
                            false,
                            false,
                            false,
                            false,
                            true,
                            false,
                            false,
                            false,
                        ]),
                    },
                }),
            });
            expect(solidOnFreeTile.status).toBe(422);
        });

        it("refuses a footprint mask that does not fit, or on an animated asset", async () => {
            const wrongShape = await createAsset({
                image: png(64, 64),
                data: mug(`maskshape-${RUN}`, {
                    placement: "GROUND",
                    footprint: { w: 2, h: 2, mask: [[true, true]] },
                }),
            });
            expect(wrongShape.status).toBe(422);

            const animated = await createAsset({
                image: png(64, 32),
                data: mug(`maskanim-${RUN}`, {
                    placement: "GROUND",
                    footprint: { w: 1, h: 1, mask: expandTileMask([[true]]) },
                    animation: {
                        frameCount: 2,
                        frameDurationMs: 100,
                        repeat: -1,
                    },
                }),
            });
            expect(codes(animated)).toEqual(["ASSET_FOOTPRINT_MASK_ANIMATED"]);
        });

        it("creates an animated base from a horizontal strip", async () => {
            const animation = {
                frameCount: 6,
                frameDurationMs: 100,
                repeat: -1,
            };
            const response = await createAsset({
                image: strip(6),
                data: {
                    key: `door-${RUN}`,
                    name: "Porta",
                    type: "DOOR",
                    footprint: { w: 1, h: 2 },
                    animation,
                },
            });

            expect(response.status).toBe(201);
            expect(response.body.asset).toMatchObject({
                sprite: { w: 32, h: 64 },
                animation,
            });

            const wrong = await createAsset({
                image: png(100, 64),
                data: {
                    name: "Porta torta",
                    type: "DOOR",
                    footprint: { w: 1, h: 1 },
                    animation,
                },
            });
            expect(wrong.status).toBe(422);
            expect(codes(wrong)).toContain("ANIMATION_FRAME_WIDTH_INVALID");
        });

        it("checks the category, the frame and the footprint", async () => {
            const noCategory = await createAsset({
                image: png(32, 32),
                data: mug(`nocat-${RUN}`, { category: undefined }),
            });
            expect(codes(noCategory)).toEqual(["CATEGORY_REQUIRED"]);

            const badFrame = await createAsset({
                image: png(40, 32),
                data: mug(`badframe-${RUN}`),
            });
            expect(codes(badFrame)).toEqual([
                "SPRITE_SIZE_NOT_MULTIPLE_OF_TILE",
            ]);

            const badFootprint = await createAsset({
                image: png(32, 32),
                data: mug(`badfoot-${RUN}`, { footprint: { w: 2, h: 1 } }),
            });
            expect(codes(badFootprint)).toEqual(["ASSET_FOOTPRINT_INVALID"]);
        });

        it("derives the key from the name, with -2 on a collision, and refuses a sent key that exists", async () => {
            const name = `Vaso Unico ${RUN}`;
            const data = {
                name,
                type: "PLANT",
                footprint: { w: 1, h: 1 },
            };
            const first = await createAsset({ image: png(32, 32), data });
            const second = await createAsset({ image: png(32, 32), data });

            expect(first.body.asset.key).toBe(
                `vaso-unico-${RUN}`.toLowerCase()
            );
            expect(second.body.asset.key).toBe(`${first.body.asset.key}-2`);

            const taken = await createAsset({
                image: png(32, 32),
                data: { ...data, key: first.body.asset.key },
            });
            expect(taken.status).toBe(409);
            expect(taken.body.code).toBe("ASSET_KEY_TAKEN");
        });

        describe("variations", () => {
            let base: Json;
            const baseKey = `caneca-${RUN}`;

            beforeAll(async () => {
                base = (
                    await createAsset({
                        image: png(32, 32),
                        data: mug(baseKey),
                    })
                ).body.asset;
            });

            it("makes 4 more colors, 5 in one family, each with its own PNG", async () => {
                for (const [index, color] of [
                    COLORS.blue,
                    COLORS.green,
                    { key: "yellow", hex: "#E2B93B" },
                    { key: "white", hex: "#EDEDED" },
                ].entries()) {
                    const response = await createVariant(base.id, {
                        image: png(32, 32),
                        data: { color },
                    });
                    expect(response.status).toBe(201);
                    expect(response.body.asset).toMatchObject({
                        baseAssetId: base.id,
                        name: base.name,
                        category: base.category,
                        placement: base.placement,
                        footprint: base.footprint,
                        colorKey: color.key,
                    });
                    expect(response.body.asset.url).not.toBe(base.url);
                    void index;
                }

                const family = await call(
                    "admin",
                    "GET",
                    `/library/assets/${base.id}`
                );
                expect(family.body.family).toMatchObject({
                    familyId: base.id,
                    variantCount: 5,
                    colorCount: 5,
                });
                expect(family.body.family.variants).toHaveLength(5);
            });

            it("refuses repeated, mismatched and overridden variations", async () => {
                const duplicated = await createVariant(base.id, {
                    image: png(32, 32),
                    data: { color: COLORS.blue },
                });
                expect(duplicated.status).toBe(422);
                expect(codes(duplicated)).toEqual(["VARIANT_DUPLICATED"]);

                const wrongSize = await createVariant(base.id, {
                    image: png(64, 32),
                    data: { color: { key: "pink", hex: "#FFC0CB" } },
                });
                expect(codes(wrongSize)).toEqual(["VARIANT_SIZE_MISMATCH"]);

                const override = await createVariant(base.id, {
                    image: png(32, 32),
                    data: {
                        color: { key: "pink", hex: "#FFC0CB" },
                        footprint: { w: 1, h: 1 },
                    },
                });
                expect(codes(override)).toEqual([
                    "VARIANT_OVERRIDE_NOT_ALLOWED",
                ]);
            });

            it("refuses a variation of a variation and a color on a base without one", async () => {
                const variants = (
                    await call("admin", "GET", `/library/assets/${base.id}`)
                ).body.family.variants as { id: string; baseAssetId: string }[];
                const variant = variants.find(
                    ({ baseAssetId }) => baseAssetId !== null
                )!;
                const nested = await createVariant(variant.id, {
                    image: png(32, 32),
                    data: { color: { key: "pink", hex: "#FFC0CB" } },
                });
                expect(nested.status).toBe(422);
                expect(codes(nested)).toEqual(["VARIANT_BASE_INVALID"]);

                const plain = (
                    await createAsset({
                        image: png(32, 32),
                        data: mug(`plain-${RUN}`, { color: undefined }),
                    })
                ).body.asset;
                const noColor = await createVariant(plain.id, {
                    image: png(32, 32),
                    data: { color: COLORS.blue },
                });
                expect(codes(noColor)).toEqual(["BASE_COLOR_REQUIRED"]);
            });

            it("needs its own footprint and action params for a new rotation", async () => {
                const chair = (
                    await createAsset({
                        image: png(32, 32),
                        data: {
                            key: `chair-${RUN}`,
                            name: "Cadeira",
                            type: "CHAIR",
                            footprint: { w: 1, h: 1 },
                            action: "SIT",
                            actionParams: {
                                seats: [{ dx: 16, dy: 8, facing: "DOWN" }],
                            },
                            color: { key: "oak", hex: "#B98B5E" },
                        },
                    })
                ).body.asset;

                const bare = await createVariant(chair.id, {
                    image: png(32, 64),
                    data: {
                        rotation: "DEG_90",
                        color: { key: "oak", hex: "#B98B5E" },
                    },
                });
                expect(bare.status).toBe(422);
                expect(codes(bare)).toEqual([
                    "FOOTPRINT_REQUIRED_FOR_NEW_ROTATION",
                    "FOOTPRINT_REQUIRED_FOR_NEW_ROTATION",
                ]);

                const rotated = await createVariant(chair.id, {
                    image: png(32, 64),
                    data: {
                        rotation: "DEG_90",
                        color: { key: "oak", hex: "#B98B5E" },
                        footprint: { w: 1, h: 2 },
                        actionParams: {
                            seats: [{ dx: 16, dy: -8, facing: "LEFT" }],
                        },
                    },
                });
                expect(rotated.status).toBe(201);
                expect(rotated.body.asset).toMatchObject({
                    rotation: "DEG_90",
                    footprint: { w: 1, h: 2, offsetX: 0 },
                    action: "SIT",
                    sprite: { w: 32, h: 64 },
                });
            });

            it("makes an animated variation with the strip of the base", async () => {
                const door = (
                    await createAsset({
                        image: strip(3),
                        data: {
                            key: `portao-${RUN}`,
                            name: "Portao",
                            type: "DOOR",
                            footprint: { w: 1, h: 2 },
                            color: { key: "oak", hex: "#B98B5E" },
                            animation: {
                                frameCount: 3,
                                frameDurationMs: 90,
                                repeat: -1,
                            },
                        },
                    })
                ).body.asset;

                const ok = await createVariant(door.id, {
                    image: strip(3),
                    data: { color: { key: "pine", hex: "#C9A66B" } },
                });
                expect(ok.status).toBe(201);
                expect(ok.body.asset.animation).toEqual(door.animation);

                const wrongStrip = await createVariant(door.id, {
                    image: strip(4),
                    data: { color: { key: "ash", hex: "#B2BEB5" } },
                });
                expect(wrongStrip.status).toBe(422);
            });
        });
    });

    describe("editing", () => {
        const make = async (
            key: string,
            extra: Record<string, unknown> = {}
        ) => {
            const base = (
                await createAsset({
                    image: png(32, 32),
                    data: mug(key, extra),
                })
            ).body.asset;
            const variant = (
                await createVariant(base.id, {
                    image: png(32, 32),
                    data: { color: COLORS.blue },
                })
            ).body.asset;
            return { base, variant };
        };

        it("applies a family field of the base to every row", async () => {
            const { base } = await make(`edit-${RUN}`);

            const family = await call(
                "admin",
                "PATCH",
                `/library/assets/${base.id}`,
                {
                    name: "Caneca grande",
                    solid: true,
                }
            );
            expect(family.status).toBe(200);
            expect(family.body.assets).toHaveLength(2);
            expect(
                family.body.assets.every(
                    (row: Json) => row.name === "Caneca grande" && row.solid
                )
            ).toBe(true);
        });

        it("refuses a family field on a variation", async () => {
            const { variant } = await make(`editvar-${RUN}`);

            const refused = await call(
                "admin",
                "PATCH",
                `/library/assets/${variant.id}`,
                { name: "Outra" }
            );
            expect(refused.status).toBe(422);
            expect(refused.body.code).toBe("VARIATION_FAMILY_FIELD");
        });

        it("refuses the footprint and the color on the edit route", async () => {
            const { base, variant } = await make(`editnot-${RUN}`);

            const footprint = await call(
                "admin",
                "PATCH",
                `/library/assets/${base.id}`,
                { footprint: { w: 1, h: 1 } }
            );
            expect(footprint.status).toBe(400);

            const color = await call(
                "admin",
                "PATCH",
                `/library/assets/${variant.id}`,
                { color: { key: "navy", hex: "#1F3A8A" } }
            );
            expect(color.status).toBe(400);
        });

        it("renames a color on every rotation of it", async () => {
            const { base, variant } = await make(`editcolor-${RUN}`);

            const renamed = await call(
                "admin",
                "PATCH",
                `/library/assets/${variant.id}/color`,
                { color: { key: "navy", hex: "#1F3A8A" } }
            );
            expect(renamed.status).toBe(200);
            expect(renamed.body.asset.colorKey).toBe("navy");

            const detail = await call(
                "admin",
                "GET",
                `/library/assets/${base.id}`
            );
            const keys = detail.body.family.variants.map(
                (row: Json) => row.colorKey
            );
            expect(keys.sort()).toEqual(["navy", "red"]);

            const clash = await call(
                "admin",
                "PATCH",
                `/library/assets/${variant.id}/color`,
                { color: COLORS.red }
            );
            expect(clash.status).toBe(422);
        });

        it("never changes the frame count", async () => {
            const door = (
                await createAsset({
                    image: strip(3),
                    data: {
                        key: `edoor-${RUN}`,
                        name: "Porta",
                        type: "DOOR",
                        footprint: { w: 1, h: 2 },
                        animation: {
                            frameCount: 3,
                            frameDurationMs: 90,
                            repeat: -1,
                        },
                    },
                })
            ).body.asset;

            const frameCount = await call(
                "admin",
                "PATCH",
                `/library/assets/${door.id}`,
                {
                    animation: { frameCount: 4 },
                }
            );
            expect(frameCount.status).toBe(422);
            expect(codes(frameCount)).toEqual(["ANIMATION_IMMUTABLE"]);

            const speed = await call(
                "admin",
                "PATCH",
                `/library/assets/${door.id}`,
                {
                    animation: { frameDurationMs: 200, repeat: 2 },
                }
            );
            expect(speed.status).toBe(200);
            expect(speed.body.asset.animation).toEqual({
                frameCount: 3,
                frameDurationMs: 200,
                repeat: 2,
            });
        });

        it("swaps the PNG of a row that is not in use, with the same frame size", async () => {
            const { variant } = await make(`swap-${RUN}`);

            const swapped = await send(
                "admin",
                "PUT",
                `/library/assets/${variant.id}/image`,
                { image: png(32, 32) }
            );
            expect(swapped.status).toBe(200);
            expect(swapped.body.asset.url).not.toBe(variant.url);

            const wrong = await send(
                "admin",
                "PUT",
                `/library/assets/${variant.id}/image`,
                { image: png(64, 32) }
            );
            expect(wrong.status).toBe(422);
        });

        it("freezes the structure while a map uses the family, and keeps name, promptText and category open", async () => {
            const { base, variant } = await make(`frozen-${RUN}`, {
                placement: "GROUND",
            });
            const access = await core.MapService.getAccess(
                users.owner,
                space.mapId
            );
            await core.MapAssetService.place(access, users.owner.id, {
                assetId: variant.id,
                tileX: 20,
                tileY: 12,
            });

            const locked = await call(
                "admin",
                "PATCH",
                `/library/assets/${base.id}`,
                {
                    solid: true,
                    surfaceHeightPx: 8,
                }
            );
            expect(locked.status).toBe(409);
            expect(locked.body.code).toBe("ASSET_IN_USE_IMMUTABLE");
            expect(locked.body.fields).toEqual(
                expect.arrayContaining(["solid", "surfaceHeightPx"])
            );

            const open = await call(
                "admin",
                "PATCH",
                `/library/assets/${base.id}`,
                {
                    name: "Caneca de balcao",
                    promptText: "Cafe?",
                    category: "ROOM_DECOR",
                }
            );
            expect(open.status).toBe(200);
            expect(open.body.assets).toHaveLength(2);

            const image = await send(
                "admin",
                "PUT",
                `/library/assets/${variant.id}/image`,
                { image: png(32, 32) }
            );
            expect(image.status).toBe(409);
            expect(image.body.code).toBe("ASSET_IN_USE_IMMUTABLE");
        });
    });

    describe("deleting, the palette and the render", () => {
        it("deletes a variation directly and a base only with family=true", async () => {
            const base = (
                await createAsset({
                    image: png(32, 32),
                    data: mug(`delete-${RUN}`),
                })
            ).body.asset;
            const variant = (
                await createVariant(base.id, {
                    image: png(32, 32),
                    data: { color: COLORS.blue },
                })
            ).body.asset;

            const refused = await call(
                "admin",
                "DELETE",
                `/library/assets/${base.id}`
            );
            expect(refused.status).toBe(422);
            expect(refused.body.code).toBe("BASE_HAS_VARIANTS");

            const direct = await call(
                "admin",
                "DELETE",
                `/library/assets/${variant.id}`
            );
            expect(direct.status).toBe(200);
            expect(direct.body.ids).toEqual([variant.id]);

            const family = await call(
                "admin",
                "DELETE",
                `/library/assets/${base.id}?family=true`
            );
            expect(family.body.ids).toEqual([base.id]);
        });

        it("hides what is deleted from the palette but keeps serving it in the render", async () => {
            const base = (
                await createAsset({
                    image: png(32, 32),
                    data: mug(`gone-${RUN}`, { placement: "GROUND" }),
                })
            ).body.asset;
            const access = await core.MapService.getAccess(
                users.owner,
                space.mapId
            );
            await core.MapAssetService.place(access, users.owner.id, {
                assetId: base.id,
                tileX: 21,
                tileY: 12,
            });

            const before = await call(
                "member",
                "GET",
                `/maps/${space.mapId}/library`
            );
            expect(before.status).toBe(200);
            expect(
                before.body.library.assets.some(
                    (row: Json) => row.id === base.id
                )
            ).toBe(true);
            expect(
                before.body.library.categories.some((tab: Json) =>
                    tab.families.some((row: Json) => row.id === base.id)
                )
            ).toBe(true);

            await call("admin", "DELETE", `/library/assets/${base.id}`);

            const after = await call(
                "member",
                "GET",
                `/maps/${space.mapId}/library`
            );
            expect(
                after.body.library.assets.some(
                    (row: Json) => row.id === base.id
                )
            ).toBe(false);
            // The ETag moves with the deletion.
            expect(after.headers.get("etag")).not.toBe(
                before.headers.get("etag")
            );

            const render = await call(
                "member",
                "GET",
                `/maps/${space.mapId}/render`
            );
            expect(
                render.body.assets.some((row: Json) => row.id === base.id)
            ).toBe(true);
        });

        it("shows a template map only the global library", async () => {
            const palette = await call(
                "admin",
                "GET",
                `/maps/${template.mapId}/library`
            );

            expect(palette.status).toBe(200);
            expect(palette.body.library.tilesets.length).toBeGreaterThan(0);
            expect(
                palette.body.library.assets.every(
                    (row: Json) => typeof row.url === "string"
                )
            ).toBe(true);
        });

        it("serves the lists, facets and overview of the admin library", async () => {
            const list = await call(
                "admin",
                "GET",
                `/library/assets?search=caneca-${RUN}`
            );
            expect(list.status).toBe(200);
            expect(list.body.families.length).toBeGreaterThan(0);
            for (const family of list.body.families) {
                expect(family).toHaveProperty("familyId");
                expect(family).not.toHaveProperty("imageId");
            }

            const facets = await call("admin", "GET", "/library/assets/facets");
            expect(facets.body).toHaveProperty("types");
            expect(facets.body).not.toHaveProperty("images");

            const overview = await call("admin", "GET", "/library/overview");
            expect(overview.body.total).toBeGreaterThan(0);
        });
    });

    describe("palette", () => {
        it("serves the global palette to the admin only", async () => {
            const admin = await call("admin", "GET", "/library/palette");

            expect(admin.status).toBe(200);
            expect(admin.body.library.tilesets.length).toBeGreaterThan(0);
            expect(Array.isArray(admin.body.library.areas)).toBe(true);

            expect(
                (await call("owner", "GET", "/library/palette")).status
            ).toBe(403);
            expect((await call(null, "GET", "/library/palette")).status).toBe(
                401
            );
        });

        it("moves the palette version when an area is created or deleted", async () => {
            const { db, areasTable, filesTable, eq } = database;
            const route = `/maps/${template.mapId}/library`;
            const first = await call("admin", "GET", route);
            const etag = first.headers.get("etag") ?? "";

            const cached = await fetch(`${baseUrl}${route}`, {
                headers: {
                    cookie: `token=${createToken(users.admin)}`,
                    "if-none-match": etag,
                },
            });
            expect(cached.status).toBe(304);

            const [file] = await db
                .insert(filesTable)
                .values({
                    originalName: `area-${RUN}.png`,
                    fileName: `area-${RUN}.png`,
                    extension: "png",
                    mimeType: "image/png",
                    sizeInBytes: 1,
                })
                .returning({ id: filesTable.id });
            const [area] = await db
                .insert(areasTable)
                .values({
                    name: `Area ${RUN}`,
                    width: 2,
                    height: 2,
                    objectCount: 0,
                    stamp: {
                        version: 1,
                        width: 2,
                        height: 2,
                        palette: [],
                        layers: {},
                        objects: [],
                        zone: null,
                    },
                    thumbnailFileId: file!.id,
                })
                .returning({ id: areasTable.id });

            const created = await fetch(`${baseUrl}${route}`, {
                headers: {
                    cookie: `token=${createToken(users.admin)}`,
                    "if-none-match": etag,
                },
            });
            expect(created.status).toBe(200);
            const createdEtag = created.headers.get("etag");
            expect(createdEtag).not.toBe(etag);

            // A deleted area still counts, so the version moves again.
            await db
                .update(areasTable)
                .set({ deletedAt: new Date(), updatedAt: new Date() })
                .where(eq(areasTable.id, area!.id));
            const deleted = await call("admin", "GET", route);
            expect(deleted.headers.get("etag")).not.toBe(createdEtag);
        });
    });

    describe("files", () => {
        it("serves a file by id with an immutable cache", async () => {
            const asset = (
                await createAsset({
                    image: png(32, 32),
                    data: mug(`file-${RUN}`),
                })
            ).body.asset;
            const { db, assetsTable, eq } = database;
            const [row] = await db
                .select({ fileId: assetsTable.fileId })
                .from(assetsTable)
                .where(eq(assetsTable.id, asset.id));

            const response = await fetch(`${baseUrl}/files/${row.fileId}`);

            expect(response.status).toBe(200);
            expect(response.headers.get("cache-control")).toBe(
                "public, max-age=31536000, immutable"
            );
            expect(response.headers.get("content-type")).toContain("image/png");
        });

        it("answers 404 for an unknown id", async () => {
            const response = await fetch(`${baseUrl}/files/does-not-exist`);

            expect(response.status).toBe(404);
        });
    });

    describe("the seed", () => {
        it("updates an unused piece in place and leaves an identical run unchanged", async () => {
            const key = `seed-${RUN}`;
            const seed = (image: Buffer, name: string) => ({
                tilesets: [],
                assets: [
                    {
                        key,
                        name,
                        type: "DECORATION" as const,
                        category: "ROOM_DECOR",
                        footprint: { w: 1, h: 1 },
                        color: COLORS.red,
                        image,
                        variants: [
                            {
                                key: `${key}-blue`,
                                color: COLORS.blue,
                                image: png(32, 32),
                            },
                        ],
                    },
                ],
            });
            const run = (image: Buffer, name: string) =>
                core.AssetService.seed(seed(image, name), {
                    createdBy: users.admin.id,
                });
            const actions = (result: Awaited<ReturnType<typeof run>>) =>
                result.assets.map(({ action }) => action);

            const art = png(32, 32);
            expect(actions(await run(art, "Seed"))).toEqual([
                "create",
                "create",
            ]);
            expect(actions(await run(art, "Seed"))).toEqual([
                "unchanged",
                "unchanged",
            ]);
            expect(actions(await run(art, "Seed renomeado"))).toEqual([
                "update",
                "unchanged",
            ]);
            const other = core.encodePng(
                32,
                32,
                Array.from({ length: 32 * 32 }, () => [200, 1, 1, 255])
            );
            expect(actions(await run(other, "Seed renomeado"))).toEqual([
                "update",
                "unchanged",
            ]);
        });
    });
});
