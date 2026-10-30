import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { io as connectClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Exercises the exposed layer: the real Express stack (auth, guards,
// controllers, multer, error mapping) and the real socket server, over HTTP
// and websockets, against a real Postgres. Off unless INTEGRATION_DATABASE_URL
// points at a throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "owner" | "member" | "other" | "outsider" | "plain";

describe.skipIf(!enabled)("maps HTTP and socket layer (real stack)", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    // Shared by the integration files: they share the database, and so the
    // global library whose files this directory holds.
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    const defs = {} as Record<string, string>;
    let organizationId: string;
    let space: { id: string; mapId: string };
    const sockets: Socket[] = [];

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
        let json: any = null;
        try {
            json = text ? JSON.parse(text) : null;
        } catch {
            json = text;
        }
        return { status: response.status, body: json };
    };

    // Layout changes go through the publication, as the editor does: take the
    // lock, publish once with its session and let the lock go.
    const publishHttp = async (
        as: UserKey,
        mapId: string,
        baseVersion: number,
        ops: unknown[]
    ) => {
        const session = `http-publish-${as}`;
        core.MapLockService.acquire(
            mapId,
            { id: users[as].id, name: as },
            session
        );
        try {
            return await call(
                as,
                "POST",
                `/maps/${mapId}/publish`,
                { publishId: crypto.randomUUID(), baseVersion, ops },
                undefined,
                { "x-editor-session": session }
            );
        } finally {
            core.MapLockService.release(mapId, session);
        }
    };

    const listen = (as: UserKey): Promise<Socket> =>
        new Promise((resolve, reject) => {
            const socket = connectClient(baseUrl, {
                auth: { token: createToken(users[as]) },
                transports: ["websocket"],
            });
            sockets.push(socket);
            socket.on("connect", () => resolve(socket));
            socket.on("connect_error", reject);
        });

    const nextEvent = <T>(socket: Socket, event: string): Promise<T> =>
        new Promise((resolve, reject) => {
            const timer = setTimeout(
                () => reject(new Error(`no ${event} within 2s`)),
                2000
            );
            socket.once(event, (payload: T) => {
                clearTimeout(timer);
                resolve(payload);
            });
        });

    const png = (width: number, height: number) =>
        core.encodePng(
            width,
            height,
            Array.from({ length: width * height }, () => [5, 5, 5, 255])
        );

    const thumbnailForm = (buffer: Buffer, type = "image/png") => {
        const form = new FormData();
        form.append(
            "thumbnail",
            new Blob([new Uint8Array(buffer)], { type }),
            "thumb.png"
        );
        return form;
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
        const { createSocketServer } =
            await import("@/lib/socket/createSocketServer");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable, organizationMembersTable } = database;

        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@http.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await make("member", "USER");
        await make("other", "USER");
        await make("outsider", "USER");
        // Belongs to no organization, so it owns nothing.
        await make("plain", "USER");

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Http Org" }
        );
        organizationId = organization.id;
        for (const key of ["member", "other"] as const) {
            await db.insert(organizationMembersTable).values({
                userId: users[key].id,
                organizationId,
                role: "MEMBER",
            });
        }

        // The default pieces are left out: this file creates its own, with
        // keys that cannot collide on a shared database.
        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: users.admin.id }
        );

        const createAsset = async (
            key: string,
            data: Partial<import("@standin/contracts").CreateAssetData>,
            size = { w: 32, h: 32 }
        ) => {
            const asset = await core.AssetService.createAsset(
                { buffer: png(size.w, size.h) },
                {
                    key: `${key}-${RUN}`,
                    name: key,
                    type: "DECORATION",
                    category: "ROOM_DECOR",
                    footprint: { w: 1, h: 1 },
                    ...data,
                },
                { organizationId: null, createdBy: users.admin.id }
            );
            defs[key] = asset.id;
        };
        await createAsset(
            "desk",
            { type: "DESK", footprint: { w: 2, h: 1 }, solid: true },
            { w: 64, h: 32 }
        );
        await createAsset("monitor", { type: "MONITOR", placement: "SURFACE" });
        await createAsset("tree", { type: "TREE", solid: true });
        await createAsset("chair", { type: "CHAIR" });
        await createAsset(
            "bundle",
            { type: "DESK", footprint: { w: 2, h: 1 } },
            { w: 64, h: 32 }
        );
        await core.AssetService.setParts(defs.bundle, null, {
            parts: [{ partAssetId: defs.chair, offsetX: 0, offsetY: 1 }],
        });

        server = http.createServer(createApp());
        createSocketServer(server);
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        sockets.forEach((socket) => socket.disconnect());
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("authentication and the permission layer", () => {
        it("answers 401 without a session on every map route", async () => {
            for (const [method, route] of [
                ["GET", "/maps/x/render"],
                ["GET", "/maps/x/export"],
                ["GET", "/maps/x/lock"],
                ["POST", "/maps/x/publish"],
                ["POST", "/maps/x/assets"],
                ["GET", "/spaces/x/desks"],
                ["GET", "/templates"],
                ["GET", "/library/tilesets"],
                ["POST", "/library/tilesets"],
                ["POST", "/library/assets"],
                ["GET", "/maps/x/library"],
            ]) {
                expect((await call(null, method, route)).status).toBe(401);
            }
        });

        it("lets only the owner create a space, and validates the body", async () => {
            const route = `/organizations/${organizationId}/spaces`;
            const body = { name: "Sala", sizeTier: "XS" };

            expect((await call("member", "POST", route, body)).status).toBe(
                403
            );
            // The admin has no implicit access to organizations.
            expect((await call("admin", "POST", route, body)).status).toBe(403);
            expect((await call("outsider", "POST", route, body)).status).toBe(
                403
            );

            const both = await call("owner", "POST", route, {
                name: "Sala",
                sizeTier: "XS",
                templateId: "t",
            });
            expect(both.status).toBe(400);
            const neither = await call("owner", "POST", route, {
                name: "Sala",
            });
            expect(neither.status).toBe(400);

            // Every tier is enabled today, so only an unknown one is refused.
            const unknown = await call("owner", "POST", route, {
                name: "Grande",
                sizeTier: "XXL",
            });
            expect(unknown.status).toBe(400);

            const created = await call("owner", "POST", route, body);
            expect(created.status).toBe(201);
            expect(created.body.mapId).toBe(created.body.space.mapId);
            space = { id: created.body.space.id, mapId: created.body.mapId };
        });
    });

    describe("render and export", () => {
        it("serves a payload that matches the contract, only to people with access", async () => {
            const { MapRenderPayloadSchema } =
                await import("@standin/contracts");

            const owner = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/render`
            );
            expect(owner.status).toBe(200);
            expect(MapRenderPayloadSchema.safeParse(owner.body).success).toBe(
                true
            );
            expect(owner.body.access).toEqual({
                canEdit: true,
                canDecorate: true,
                ownDeskMapAssetId: null,
            });

            const member = await call(
                "member",
                "GET",
                `/maps/${space.mapId}/render`
            );
            expect(member.status).toBe(200);
            expect(member.body.access.canEdit).toBe(false);

            expect(
                (await call("outsider", "GET", `/maps/${space.mapId}/render`))
                    .status
            ).toBe(404);
            expect(
                (await call("admin", "GET", `/maps/${space.mapId}/render`))
                    .status
            ).toBe(404);
            expect(
                (await call("owner", "GET", "/maps/nope/render")).status
            ).toBe(404);
        });

        it("exports the Tiled JSON", async () => {
            const response = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/export`
            );

            expect(response.status).toBe(200);
            expect(response.body.type).toBe("map");
            expect(response.body.tilesets.length).toBeGreaterThan(0);
            expect(
                (await call("outsider", "GET", `/maps/${space.mapId}/export`))
                    .status
            ).toBe(404);
        });
    });

    describe("publish over HTTP", () => {
        it("is owner only, validated, and answers the stale and invalid cases", async () => {
            const op = { type: "set_background", color: "#123456" };

            expect(
                (await publishHttp("member", space.mapId, 1, [op])).status
            ).toBe(403);
            // A bad operation and a bad base version break the contract.
            expect(
                (
                    await publishHttp("owner", space.mapId, 1, [
                        { type: "set_background", color: "red" },
                    ])
                ).status
            ).toBe(400);
            expect(
                (await publishHttp("owner", space.mapId, 0, [op])).status
            ).toBe(400);

            const ok = await publishHttp("owner", space.mapId, 1, [op]);
            expect(ok.status).toBe(200);
            expect(ok.body.version).toBe(2);

            const stale = await publishHttp("owner", space.mapId, 1, [op]);
            expect(stale.status).toBe(409);
            expect(stale.body).toMatchObject({
                code: "STALE_LAYOUT_VERSION",
                version: 2,
            });

            const invalid = await publishHttp("owner", space.mapId, 2, [
                { type: "erase", layer: "ground", cells: [[999, 0]] },
            ]);
            expect(invalid.status).toBe(422);
            expect(invalid.body.errors[0]).toMatchObject({
                opIndex: 0,
                code: "CELL_OUT_OF_BOUNDS",
                path: "999,0",
            });
        });

        it("paints, and a batch with a bad operation writes nothing", async () => {
            const floors = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/library`
            );
// The palette only paints tiles that have a category.
            const tilesetId = floors.body.library.tilesets.find(
                (tileset: { tileMeta?: Record<string, unknown> }) =>
                    tileset.tileMeta?.["1"]
            ).id;
            const before = (
                await call("owner", "GET", `/maps/${space.mapId}/render`)
            ).body.map.layoutVersion;

            const bad = await publishHttp("owner", space.mapId, before, [
                {
                    type: "paint",
                    layer: "ground",
                    tilesetId,
                    tileIndex: 1,
                    cells: [[3, 3]],
                },
                { type: "erase", layer: "ground", cells: [[999, 999]] },
            ]);
            expect(bad.status).toBe(422);
            expect(bad.body.errors[0].opIndex).toBe(1);
            expect(
                (await call("owner", "GET", `/maps/${space.mapId}/render`))
                    .body.map.layoutVersion
            ).toBe(before);

            const painted = await publishHttp("owner", space.mapId, before, [
                {
                    type: "paint",
                    layer: "ground",
                    tilesetId,
                    tileIndex: 1,
                    cells: [[3, 3]],
                },
            ]);
            expect(painted.status).toBe(200);
            expect(painted.body.version).toBe(before + 1);
        });
    });

    describe("objects and desks over HTTP", () => {
        let deskId: string;

        it("lets the owner place, and answers the placement errors with 422", async () => {
            const route = `/maps/${space.mapId}/assets`;

            const placed = await call("owner", "POST", route, {
                assetId: defs.desk,
                tileX: 5,
                tileY: 5,
            });
            expect(placed.status).toBe(201);
            deskId = placed.body.placed[0].id;

            const overlap = await call("owner", "POST", route, {
                assetId: defs.tree,
                tileX: 5,
                tileY: 5,
            });
            expect(overlap.status).toBe(422);
            expect(overlap.body.error).toContain("position");

            expect(
                (
                    await call("owner", "POST", route, {
                        assetId: "",
                        tileX: 1,
                        tileY: 1,
                    })
                ).status
            ).toBe(400);
            expect(
                (
                    await call("owner", "POST", route, {
                        assetId: defs.tree,
                        tileX: 1.5,
                        tileY: 1,
                    })
                ).status
            ).toBe(400);
            expect(
                (
                    await call("outsider", "POST", route, {
                        assetId: defs.tree,
                        tileX: 1,
                        tileY: 1,
                    })
                ).status
            ).toBe(404);
            // A member can read the map but not drop things on the floor.
            expect(
                (
                    await call("member", "POST", route, {
                        assetId: defs.tree,
                        tileX: 1,
                        tileY: 1,
                    })
                ).status
            ).toBe(403);
        });

        it("claims, conflicts, assigns and releases desks", async () => {
            const base = `/spaces/${space.id}/desks`;

            expect(
                (await call("member", "POST", `${base}/${deskId}/claim`, {}))
                    .status
            ).toBe(200);
            const taken = await call(
                "other",
                "POST",
                `${base}/${deskId}/claim`,
                {}
            );
            expect(taken.status).toBe(409);
            expect(taken.body.error).toContain("owner");

            expect(
                (await call("outsider", "POST", `${base}/${deskId}/claim`, {}))
                    .status
            ).toBe(404);
            expect(
                (
                    await call("member", "POST", `${base}/${deskId}/claim`, {
                        swap: "yes",
                    })
                ).status
            ).toBe(400);

            const list = await call("other", "GET", base);
            expect(list.body.desks).toEqual([
                { mapAssetId: deskId, userId: users.member.id },
            ]);

            // Releasing someone else's desk takes the owner of the organization.
            expect(
                (await call("other", "DELETE", `${base}/${deskId}/claim`))
                    .status
            ).toBe(403);
            expect(
                (await call("owner", "DELETE", `${base}/${deskId}/claim`))
                    .status
            ).toBe(200);

            expect(
                (
                    await call("member", "POST", `${base}/${deskId}/assign`, {
                        userId: users.other.id,
                    })
                ).status
            ).toBe(403);
            expect(
                (await call("owner", "POST", `${base}/${deskId}/assign`, {}))
                    .status
            ).toBe(400);
            const assigned = await call(
                "owner",
                "POST",
                `${base}/${deskId}/assign`,
                { userId: users.other.id }
            );
            expect(assigned.status).toBe(200);
            expect(assigned.body).toEqual({
                mapAssetId: deskId,
                userId: users.other.id,
            });
        });

        it("lets a member decorate only their own desk", async () => {
            const route = `/maps/${space.mapId}/assets`;

            const ownDesk = await call("other", "POST", route, {
                assetId: defs.monitor,
                tileX: 5,
                tileY: 5,
                parentId: deskId,
            });
            expect(ownDesk.status).toBe(201);

            const notTheirs = await call("member", "POST", route, {
                assetId: defs.monitor,
                tileX: 6,
                tileY: 5,
                parentId: deskId,
            });
            expect(notTheirs.status).toBe(403);

            const monitorId = ownDesk.body.placed[0].id;
            const moved = await call(
                "other",
                "PATCH",
                `${route}/${monitorId}`,
                { tileX: 6 }
            );
            expect(moved.status).toBe(200);
            expect(moved.body.placed[0]).toMatchObject({
                id: monitorId,
                tileX: 6,
            });
            expect(
                (await call("other", "PATCH", `${route}/${monitorId}`, {}))
                    .status
            ).toBe(400);
            expect(
                (
                    await call("member", "PATCH", `${route}/${monitorId}`, {
                        tileX: 5,
                    })
                ).status
            ).toBe(403);
            expect(
                (
                    await call("other", "PATCH", `${route}/does-not-exist`, {
                        tileX: 5,
                    })
                ).status
            ).toBe(404);
        });

        it("needs releaseDesk to delete a claimed desk", async () => {
            const route = `/maps/${space.mapId}/assets/${deskId}`;

            const refused = await call("owner", "DELETE", route);
            expect(refused.status).toBe(409);
            expect(refused.body.code ?? refused.body.error).toBeDefined();
            expect(
                (await call("owner", "DELETE", `${route}?releaseDesk=maybe`))
                    .status
            ).toBe(400);

            const removed = await call(
                "owner",
                "DELETE",
                `${route}?releaseDesk=true`
            );
            expect(removed.status).toBe(200);
            expect(removed.body.removedIds).toContain(deskId);
            expect(removed.body.releasedDeskUserId).toBe(users.other.id);
        });
    });

    describe("the map lock over HTTP", () => {
        const holder = () => ({ id: users.admin.id, name: "Admin" });

        it("serves limits and lock in the render and on GET /lock", async () => {
            const { MapRenderPayloadSchema, MAX_OBJECTS_PER_MAP } =
                await import("@standin/contracts");

            const free = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/render`
            );
            expect(MapRenderPayloadSchema.safeParse(free.body).success).toBe(
                true
            );
            expect(free.body.lock).toEqual({ locked: false });
            expect(free.body.limits).toEqual({
                objectsUsed: free.body.placed.length,
                objectsMax: MAX_OBJECTS_PER_MAP,
            });
            expect(
                (await call("owner", "GET", `/maps/${space.mapId}/lock`)).body
            ).toEqual({ locked: false });

            core.MapLockService.acquire(space.mapId, holder(), "session-a");
            try {
                const locked = await call(
                    "member",
                    "GET",
                    `/maps/${space.mapId}/lock`
                );
                expect(locked.status).toBe(200);
                expect(locked.body.locked).toBe(true);
                expect(locked.body.by).toEqual(holder());
                expect(typeof locked.body.since).toBe("string");
                expect(locked.body.sessionId).toBeUndefined();

                const render = await call(
                    "member",
                    "GET",
                    `/maps/${space.mapId}/render`
                );
                expect(render.body.lock).toEqual(locked.body);

                expect(
                    (
                        await call(
                            "outsider",
                            "GET",
                            `/maps/${space.mapId}/lock`
                        )
                    ).status
                ).toBe(404);
            } finally {
                core.MapLockService.release(space.mapId, "session-a");
            }
        });

        it("answers 423 on every object and desk route, whoever asks", async () => {
            const placed = await call(
                "owner",
                "POST",
                `/maps/${space.mapId}/assets`,
                { assetId: defs.desk, tileX: 14, tileY: 14 }
            );
            expect(placed.status).toBe(201);
            const id = placed.body.placed[0].id;
            const desks = `/spaces/${space.id}/desks`;

            core.MapLockService.acquire(space.mapId, holder(), "session-a");
            try {
                const attempts: [
                    "owner" | "member",
                    string,
                    string,
                    unknown?,
                ][] = [
                    [
                        "owner",
                        "POST",
                        `/maps/${space.mapId}/assets`,
                        { assetId: defs.tree, tileX: 1, tileY: 1 },
                    ],
                    [
                        "owner",
                        "PATCH",
                        `/maps/${space.mapId}/assets/${id}`,
                        { tileX: 15, tileY: 14 },
                    ],
                    ["owner", "DELETE", `/maps/${space.mapId}/assets/${id}`],
                    ["member", "POST", `${desks}/${id}/claim`, {}],
                    ["member", "DELETE", `${desks}/${id}/claim`],
                    [
                        "owner",
                        "POST",
                        `${desks}/${id}/assign`,
                        { userId: users.other.id },
                    ],
                ];
                for (const [as, method, route, body] of attempts) {
                    const response = await call(as, method, route, body);
                    expect(response.status, `${method} ${route}`).toBe(423);
                    expect(response.body.code).toBe("MAP_LOCKED");
                    expect(response.body.by).toEqual(holder());
                    expect(typeof response.body.since).toBe("string");
                }

                // Reading stays free.
                expect(
                    (
                        await call(
                            "member",
                            "GET",
                            `/maps/${space.mapId}/render`
                        )
                    ).status
                ).toBe(200);
                expect(
                    (await call("member", "GET", desks)).status
                ).toBe(200);
            } finally {
                core.MapLockService.release(space.mapId, "session-a");
            }

            expect(
                (
                    await call(
                        "owner",
                        "DELETE",
                        `/maps/${space.mapId}/assets/${id}`
                    )
                ).status
            ).toBe(200);
        });

        it("refuses to delete a space or a template with the map locked", async () => {
            const spaces = `/organizations/${organizationId}/spaces`;
            const created = await call("owner", "POST", spaces, {
                name: "Descartavel",
                sizeTier: "XS",
            });
            expect(created.status).toBe(201);

            core.MapLockService.acquire(created.body.mapId, holder(), "s-1");
            const refusedSpace = await call(
                "owner",
                "DELETE",
                `${spaces}/${created.body.space.id}`
            );
            expect(refusedSpace.status).toBe(423);
            expect(refusedSpace.body.code).toBe("MAP_LOCKED");
            core.MapLockService.release(created.body.mapId, "s-1");
            expect(
                (
                    await call(
                        "owner",
                        "DELETE",
                        `${spaces}/${created.body.space.id}`
                    )
                ).status
            ).toBe(200);

            const tpl = await call("admin", "POST", "/templates", {
                name: "Descartavel",
                sizeTier: "XS",
            });
            expect(tpl.status).toBe(201);
            core.MapLockService.acquire(tpl.body.mapId, holder(), "s-2");
            const refusedTemplate = await call(
                "admin",
                "DELETE",
                `/templates/${tpl.body.templateId}`
            );
            expect(refusedTemplate.status).toBe(423);
            expect(refusedTemplate.body.code).toBe("MAP_LOCKED");
            core.MapLockService.release(tpl.body.mapId, "s-2");
            expect(
                (
                    await call(
                        "admin",
                        "DELETE",
                        `/templates/${tpl.body.templateId}`
                    )
                ).status
            ).toBe(200);
        });
    });

    describe("socket events", () => {
        it("delivers the space events to the people in the room, after the commit", async () => {
            const room = await listen("owner");
            const watcher = await listen("member");
            const outsider = await listen("outsider");

            // One after the other: the owner only hears the watcher arrive if
            // the owner was already inside.
            const join = (socket: typeof room, key: "owner" | "member") =>
                socket.emit("space:join", {
                    organizationId,
                    spaceId: space.id,
                    userId: users[key].id,
                });
            const ownerJoined = nextEvent(room, "space:joined");
            join(room, "owner");
            await ownerJoined;
            const peerJoined = nextEvent(room, "space:peer-joined");
            join(watcher, "member");
            await peerJoined;

            const received: string[] = [];
            const heardByOutsider: string[] = [];
            const events = [
                "map_published",
                "asset_placed",
                "asset_moved",
                "asset_removed",
                "desk_claimed",
                "desk_released",
            ];
            for (const event of events) {
                watcher.on(event, () => received.push(event));
                outsider.on(event, () => heardByOutsider.push(event));
            }

            const render = await call(
                "owner",
                "GET",
                `/maps/${space.mapId}/render`
            );
            const version = render.body.map.layoutVersion;

            const layoutEvent = nextEvent<{ version: number }>(
                watcher,
                "map_published"
            );
            await publishHttp("owner", space.mapId, version, [
                { type: "set_background", color: "#654321" },
            ]);
            expect((await layoutEvent).version).toBe(version + 1);

            const placedEvent = nextEvent<{ placed: { id: string }[] }>(
                watcher,
                "asset_placed"
            );
            const placed = await call(
                "owner",
                "POST",
                `/maps/${space.mapId}/assets`,
                {
                    assetId: defs.desk,
                    tileX: 8,
                    tileY: 10,
                }
            );
            const deskRow = placed.body.placed[0].id;
            expect((await placedEvent).placed[0].id).toBe(deskRow);

            const movedEvent = nextEvent(watcher, "asset_moved");
            await call(
                "owner",
                "PATCH",
                `/maps/${space.mapId}/assets/${deskRow}`,
                { tileX: 9 }
            );
            await movedEvent;

            const claimedEvent = nextEvent<{ userId: string }>(
                watcher,
                "desk_claimed"
            );
            await call(
                "member",
                "POST",
                `/spaces/${space.id}/desks/${deskRow}/claim`,
                {}
            );
            expect((await claimedEvent).userId).toBe(users.member.id);

            const releasedEvent = nextEvent(watcher, "desk_released");
            const removedEvent = nextEvent<{ removedIds: string[] }>(
                watcher,
                "asset_removed"
            );
            await call(
                "owner",
                "DELETE",
                `/maps/${space.mapId}/assets/${deskRow}?releaseDesk=true`
            );
            expect((await removedEvent).removedIds).toContain(deskRow);
            await releasedEvent;

            // Someone who never joined the space heard nothing.
            expect(heardByOutsider).toEqual([]);
            expect(received).toEqual(
                expect.arrayContaining([
                    "map_published",
                    "asset_placed",
                    "asset_moved",
                    "desk_claimed",
                    "asset_removed",
                    "desk_released",
                ])
            );
        });

        it("does not emit when the request fails", async () => {
            const watcher = await listen("owner");
            watcher.emit("space:join", {
                organizationId,
                spaceId: space.id,
                userId: users.owner.id,
            });
            await new Promise((resolve) => setTimeout(resolve, 200));

            let heard = false;
            watcher.on("map_published", () => (heard = true));

            const stale = await publishHttp("owner", space.mapId, 1, [
                { type: "set_background", color: "#000000" },
            ]);
            await new Promise((resolve) => setTimeout(resolve, 300));

            expect(stale.status).toBe(409);
            expect(heard).toBe(false);
        });
    });

    describe("templates over HTTP", () => {
        let template: { id: string; mapId: string };

        it("creates as admin only and answers with both ids", async () => {
            const body = {
                name: "Escritório",
                description: "Modelo",
                sizeTier: "S",
            };

            expect(
                (await call("owner", "POST", "/templates", body)).status
            ).toBe(403);
            expect(
                (await call("member", "POST", "/templates", body)).status
            ).toBe(403);
            expect(
                (
                    await call("admin", "POST", "/templates", {
                        name: "x",
                        sizeTier: "S",
                    })
                ).status
            ).toBe(400);
            expect(
                (
                    await call("admin", "POST", "/templates", {
                        ...body,
                        sizeTier: "XXL",
                    })
                ).status
            ).toBe(400);

            const created = await call("admin", "POST", "/templates", body);
            expect(created.status).toBe(201);
            expect(created.body.templateId).toBe(created.body.template.id);
            expect(created.body.mapId).toBe(created.body.template.mapId);
            expect(created.body.template.status).toBe("DRAFT");
            template = {
                id: created.body.templateId,
                mapId: created.body.mapId,
            };
        });

        it("edits with PATCH, admin only", async () => {
            const route = `/templates/${template.id}`;

            expect(
                (await call("owner", "PATCH", route, { name: "Novo nome" }))
                    .status
            ).toBe(403);
            expect(
                (await call("admin", "PATCH", route, { name: "a" })).status
            ).toBe(400);

            const renamed = await call("admin", "PATCH", route, {
                name: "Novo nome",
                description: "Outra",
            });
            expect(renamed.status).toBe(200);
            expect(renamed.body.template).toMatchObject({
                name: "Novo nome",
                description: "Outra",
            });
            expect(
                (
                    await call("admin", "PATCH", "/templates/nope", {
                        name: "Novo nome",
                    })
                ).status
            ).toBe(404);
        });

        it("uploads the thumbnail as a PNG up to 3 MB, with a proportion warning", async () => {
            const route = `/templates/${template.id}/thumbnail`;

            expect(
                (
                    await call(
                        "owner",
                        "PUT",
                        route,
                        undefined,
                        thumbnailForm(png(60, 40))
                    )
                ).status
            ).toBe(403);
            expect(
                (await call("admin", "PUT", route)).status
            ).toBeGreaterThanOrEqual(400);

            const text = await call(
                "admin",
                "PUT",
                route,
                undefined,
                thumbnailForm(Buffer.from("hello"), "text/plain")
            );
            expect(text.status).toBe(400);

            const tooBig = await call(
                "admin",
                "PUT",
                route,
                undefined,
                thumbnailForm(Buffer.alloc(3 * 1024 * 1024 + 1), "image/png")
            );
            expect(tooBig.status).toBe(400);

            const wrongShape = await call(
                "admin",
                "PUT",
                route,
                undefined,
                thumbnailForm(png(40, 40))
            );
            expect(wrongShape.status).toBe(200);
            expect(wrongShape.body.warnings).toHaveLength(1);

            // The map is 30 x 20, so 3:2.
            const good = await call(
                "admin",
                "PUT",
                route,
                undefined,
                thumbnailForm(png(60, 40))
            );
            expect(good.status).toBe(200);
            expect(good.body.warnings).toEqual([]);
            expect(good.body.template.thumbnailUrl).toContain("templates/");
        });

        it("refuses to publish without a thumbnail and with a private asset", async () => {
            const bare = await call("admin", "POST", "/templates", {
                name: "Sem miniatura",
                sizeTier: "XS",
            });
            const publishBare = await call(
                "admin",
                "POST",
                `/templates/${bare.body.templateId}/publish`
            );
            expect(publishBare.status).toBe(422);
            expect(publishBare.body.error).toContain("miniatura");

            const database = await import("@standin/database");
            const { db, assetsTable } = database;
            const [file] = await db.select().from(database.filesTable).limit(1);
            const [privateAsset] = await db
                .insert(assetsTable)
                .values({
                    organizationId,
                    fileId: file.id,
                    createdBy: users.admin.id,
                    key: `secret-http-${RUN}`,
                    name: "secret",
                    type: "DECORATION",
                    category: "ROOM_DECOR",
                    spriteW: 32,
                    spriteH: 32,
                })
                .returning({ id: assetsTable.id });
            await db.insert(database.mapAssetsTable).values({
                mapId: bare.body.mapId,
                assetId: privateAsset.id,
                tileX: 3,
                tileY: 3,
            });
            await call(
                "admin",
                "PUT",
                `/templates/${bare.body.templateId}/thumbnail`,
                undefined,
                thumbnailForm(png(48, 32))
            );

            const publishPrivate = await call(
                "admin",
                "POST",
                `/templates/${bare.body.templateId}/publish`
            );
            expect(publishPrivate.status).toBe(422);
            expect(publishPrivate.body.error).toContain("private");
        });

        it("publishes, and the catalog shows what each role may see", async () => {
            expect(
                (
                    await call(
                        "owner",
                        "POST",
                        `/templates/${template.id}/publish`
                    )
                ).status
            ).toBe(403);

            const published = await call(
                "admin",
                "POST",
                `/templates/${template.id}/publish`
            );
            expect(published.status).toBe(200);
            expect(published.body.template.status).toBe("PUBLISHED");
            expect(
                (
                    await call(
                        "admin",
                        "POST",
                        `/templates/${template.id}/publish`
                    )
                ).status
            ).toBe(409);

            const asAdmin = await call("admin", "GET", "/templates");
            const asOwner = await call("owner", "GET", "/templates");
            expect(asAdmin.body.templates.length).toBeGreaterThan(
                asOwner.body.templates.length
            );
            // Other files publish templates to the same database too.
            expect(
                asOwner.body.templates.map((item: { id: string }) => item.id)
            ).toContain(template.id);

            expect((await call("member", "GET", "/templates")).status).toBe(
                403
            );
            expect((await call("plain", "GET", "/templates")).status).toBe(403);

            const filtered = await call(
                "admin",
                "GET",
                "/templates?sizeTier=XS"
            );
            expect(
                filtered.body.templates.every(
                    (item: { sizeTier: string }) => item.sizeTier === "XS"
                )
            ).toBe(true);
            expect(
                (await call("admin", "GET", "/templates?sizeTier=ZZ")).status
            ).toBe(400);
        });

        it("starts a space from the template over HTTP", async () => {
            const created = await call(
                "owner",
                "POST",
                `/organizations/${organizationId}/spaces`,
                {
                    name: "Do template",
                    templateId: template.id,
                }
            );
            expect(created.status).toBe(201);
            expect(created.body.mapId).not.toBe(template.mapId);

            const unknown = await call(
                "owner",
                "POST",
                `/organizations/${organizationId}/spaces`,
                {
                    name: "Nada",
                    templateId: "nope",
                }
            );
            expect(unknown.status).toBe(422);
        });

        it("exposes the template map to the admin only, with its own socket room", async () => {
            expect(
                (await call("admin", "GET", `/maps/${template.mapId}/render`))
                    .status
            ).toBe(200);
            expect(
                (await call("owner", "GET", `/maps/${template.mapId}/render`))
                    .status
            ).toBe(404);

            const admin = await listen("admin");
            const stranger = await listen("owner");
            admin.emit("map:join", { mapId: template.mapId });
            stranger.emit("map:join", { mapId: template.mapId });
            await new Promise((resolve) => setTimeout(resolve, 300));

            let strangerHeard = false;
            stranger.on("map_published", () => (strangerHeard = true));
            const heard = nextEvent<{ mapId: string }>(admin, "map_published");

            const render = await call(
                "admin",
                "GET",
                `/maps/${template.mapId}/render`
            );
            const edit = await publishHttp(
                "admin",
                template.mapId,
                render.body.map.layoutVersion,
                [{ type: "set_background", color: "#0a0a0a" }]
            );
            expect(edit.status).toBe(200);
            expect((await heard).mapId).toBe(template.mapId);

            await new Promise((resolve) => setTimeout(resolve, 200));
            expect(strangerHeard).toBe(false);
            // Owners of organizations cannot edit a template map either.
            expect(
                (
                    await publishHttp("owner", template.mapId, 1, [
                        { type: "set_background", color: "#000000" },
                    ])
                ).status
            ).toBe(404);
        });

        it("retires and deletes by status", async () => {
            const deletePublished = await call(
                "admin",
                "DELETE",
                `/templates/${template.id}`
            );
            expect(deletePublished.status).toBe(409);

            expect(
                (
                    await call(
                        "owner",
                        "POST",
                        `/templates/${template.id}/retire`
                    )
                ).status
            ).toBe(403);
            const retired = await call(
                "admin",
                "POST",
                `/templates/${template.id}/retire`
            );
            expect(retired.body.template.status).toBe("RETIRED");
            expect(
                (
                    await call(
                        "admin",
                        "POST",
                        `/templates/${template.id}/retire`
                    )
                ).status
            ).toBe(409);

            expect(
                (await call("owner", "DELETE", `/templates/${template.id}`))
                    .status
            ).toBe(403);
            expect(
                (await call("admin", "DELETE", `/templates/${template.id}`))
                    .status
            ).toBe(200);
            expect(
                (await call("admin", "GET", `/templates/${template.id}`)).status
            ).toBe(404);
        });
    });

    describe("the asset library over HTTP", () => {
        it("serves the global library to the admin only", async () => {
            const admin = await call("admin", "GET", "/library/tilesets");
            expect(admin.status).toBe(200);
            expect(
                admin.body.tilesets.map(
                    (tileset: { name: string }) => tileset.name
                )
            ).toEqual(expect.arrayContaining(["Pisos", "Paredes"]));

            for (const key of ["owner", "member", "outsider"] as const) {
                expect(
                    (await call(key, "GET", "/library/tilesets")).status
                ).toBe(403);
            }
        });

        it("answers 403 SCOPE_FORBIDDEN for an organizationId", async () => {
            const response = await call(
                "admin",
                "GET",
                `/library/tilesets?organizationId=${organizationId}`
            );

            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SCOPE_FORBIDDEN");
        });
    });
});
