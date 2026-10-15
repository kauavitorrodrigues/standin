import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { io as connectClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";

// Exercises POST /maps/:mapId/publish through the real Express stack and the
// real socket server, against a real Postgres. Off unless
// INTEGRATION_DATABASE_URL points at a throwaway database different from the
// app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "owner" | "member" | "other" | "outsider";

describe.skipIf(!enabled)("publish over HTTP (real stack)", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    const defs = {} as Record<string, string>;
    let organizationId: string;
    let floorTilesetId: string;
    const sockets: Socket[] = [];
    let counter = 0;

    const call = async (
        as: UserKey | null,
        method: string,
        route: string,
        body?: unknown,
        extraHeaders: Record<string, string> = {}
    ) => {
        const headers: Record<string, string> = { ...extraHeaders };
        if (as) headers.cookie = `token=${createToken(users[as])}`;
        if (body !== undefined) headers["content-type"] = "application/json";

        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
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

    const png = (width: number, height: number) =>
        core.encodePng(
            width,
            height,
            Array.from({ length: width * height }, () => [5, 5, 5, 255])
        );

    // A space of its own per test, so versions and locks never leak.
    const newSpace = async () => {
        counter += 1;
        const space = await core.SpaceService.create(
            organizationId,
            users.owner.id,
            { name: `Publish ${RUN} ${counter}`, sizeTier: "XS" }
        );
        return { id: space.id, mapId: space.mapId };
    };

    const hold = (as: UserKey, mapId: string, session: string) => {
        const result = core.MapLockService.acquire(
            mapId,
            { id: users[as].id, name: as },
            session
        );
        expect(result.ok).toBe(true);
    };

    const publish = (
        as: UserKey | null,
        mapId: string,
        session: string | null,
        body: unknown
    ) =>
        call(
            as,
            "POST",
            `/maps/${mapId}/publish`,
            body,
            session ? { "x-editor-session": session } : {}
        );

    const request = (baseVersion: number, ops: EditorOp[]) => ({
        publishId: crypto.randomUUID(),
        baseVersion,
        ops,
    });

    const background = (color: string): EditorOp => ({
        type: "set_background",
        color,
    });

    const renderOf = async (as: UserKey, mapId: string) =>
        (await call(as, "GET", `/maps/${mapId}/render`)).body;

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

        const { db, usersTable, organizationMembersTable, tilesetsTable } =
            database;

        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@publish.dev`,
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

        const organization = await core.OrganizationService.create(
            users.owner.id,
            { name: "Publish Org" }
        );
        organizationId = organization.id;
        for (const key of ["member", "other"] as const) {
            await db.insert(organizationMembersTable).values({
                userId: users[key].id,
                organizationId,
                role: "MEMBER",
            });
        }

        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: users.admin.id }
        );
        const tilesets = await db
            .select()
            .from(tilesetsTable)
            .where(database.isNull(tilesetsTable.organizationId));
        floorTilesetId = tilesets.find(({ key }) => key === "floors")!.id;

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
        await createAsset("chair", { type: "CHAIR" });

        server = http.createServer(createApp());
        createSocketServer(server);
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        sockets.forEach((socket) => socket.disconnect());
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("what a publish writes", () => {
        it("publishes a background change and raises the version", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");

            const response = await publish(
                "owner",
                mapId,
                "s-1",
                request(1, [background("#123456")])
            );

            expect(response.status).toBe(200);
            expect(response.body.version).toBe(2);
            expect(response.body.idMap).toEqual({});
            // The session never comes back to the client.
            expect(JSON.stringify(response.body)).not.toContain("s-1");

            const render = await renderOf("owner", mapId);
            expect(render.map.layoutVersion).toBe(2);
            expect(render.map.layout.backgroundcolor).toBe("#123456");
        });

        it("resolves a tempId to the real id of the new object", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");

            const response = await publish(
                "owner",
                mapId,
                "s-1",
                request(1, [
                    {
                        type: "place_asset",
                        tempId: "tmp_chair",
                        assetId: defs.chair,
                        tileX: 6,
                        tileY: 6,
                    },
                ])
            );

            expect(response.status).toBe(200);
            const realId = response.body.idMap.tmp_chair;
            expect(typeof realId).toBe("string");
            expect(realId).not.toBe("tmp_chair");
            expect(response.body.limits.objectsUsed).toBe(1);

            const render = await renderOf("owner", mapId);
            expect(render.placed.map(({ id }: { id: string }) => id)).toEqual([
                realId,
            ]);
        });

        it("answers a repeated publishId with the same result and no new version", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");
            const body = request(1, [
                {
                    type: "place_asset",
                    tempId: "tmp_a",
                    assetId: defs.chair,
                    tileX: 7,
                    tileY: 7,
                },
            ]);

            const first = await publish("owner", mapId, "s-1", body);
            const again = await publish("owner", mapId, "s-1", body);

            expect(first.status).toBe(200);
            expect(again).toEqual(first);
            const render = await renderOf("owner", mapId);
            expect(render.map.layoutVersion).toBe(first.body.version);
            expect(render.placed).toHaveLength(1);
        });

        it("answers 409 with the current version for an old baseVersion", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");
            const ok = await publish(
                "owner",
                mapId,
                "s-1",
                request(1, [background("#111111")])
            );
            expect(ok.status).toBe(200);

            const stale = await publish(
                "owner",
                mapId,
                "s-1",
                request(1, [background("#222222")])
            );

            expect(stale.status).toBe(409);
            expect(stale.body).toMatchObject({
                code: "STALE_LAYOUT_VERSION",
                version: 2,
            });
        });

        it("answers 422 with the index of the failing operation and writes nothing", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");

            const response = await publish(
                "owner",
                mapId,
                "s-1",
                request(1, [
                    background("#abcdef"),
                    { type: "erase", layer: "ground", cells: [[999, 0]] },
                ])
            );

            expect(response.status).toBe(422);
            expect(response.body.errors[0]).toMatchObject({
                opIndex: 1,
                code: "CELL_OUT_OF_BOUNDS",
                path: expect.any(String),
                message: expect.any(String),
            });

            const render = await renderOf("owner", mapId);
            expect(render.map.layoutVersion).toBe(1);
            expect(render.map.layout.backgroundcolor).not.toBe("#abcdef");
        });

        it("answers 400 for a body that breaks the contract", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");

            const response = await publish("owner", mapId, "s-1", {
                publishId: "not-a-uuid",
                baseVersion: 1,
                ops: [],
            });

            expect(response.status).toBe(400);
        });

        it("gives the same map as replaying the operations on the client", async () => {
            const { mapId } = await newSpace();
            const { buildEditorModel, replayOps } =
                await import("@standin/contracts");

            const render = await renderOf("owner", mapId);
            const library = (
                await call("owner", "GET", `/maps/${mapId}/library`)
            ).body.library;
            const ops: EditorOp[] = [
                background("#0f0f0f"),
                {
                    type: "paint",
                    layer: "ground",
                    tilesetId: floorTilesetId,
                    tileIndex: 1,
                    cells: [
                        [3, 3],
                        [4, 3],
                    ],
                },
                {
                    type: "set_zone",
                    zone: {
                        kind: "area",
                        rect: { x: 8, y: 8, w: 3, h: 3 },
                        label: "Reuniao",
                    },
                },
                {
                    type: "place_asset",
                    tempId: "tmp_desk",
                    assetId: defs.desk,
                    tileX: 10,
                    tileY: 4,
                },
                {
                    type: "place_asset",
                    tempId: "tmp_chair",
                    assetId: defs.chair,
                    tileX: 12,
                    tileY: 4,
                },
            ];

            const replayed = replayOps(buildEditorModel(render, library), ops);
            expect(replayed.ok).toBe(true);
            if (!replayed.ok) return;

            hold("owner", mapId, "s-1");
            const response = await publish(
                "owner",
                mapId,
                "s-1",
                request(render.map.layoutVersion, ops)
            );
            expect(response.status).toBe(200);

            const after = await renderOf("owner", mapId);
            expect(after.map.layout).toEqual(replayed.model.layout);

            const shape = (list: any[]) =>
                list
                    .map(({ assetId, tileX, tileY, parentId }) => ({
                        assetId,
                        tileX,
                        tileY,
                        parentId: parentId ?? null,
                    }))
                    .sort((a, b) => a.tileX - b.tileX);
            expect(shape(after.placed)).toEqual(shape(replayed.model.placed));
            expect(after.limits).toEqual(replayed.model.limits);
        });
    });

    describe("the lock guard", () => {
        it("answers 423 LOCK_NOT_HELD with no lock, and with no session header", async () => {
            const { mapId } = await newSpace();
            const body = request(1, [background("#010101")]);

            const free = await publish("owner", mapId, "s-1", body);
            expect(free.status).toBe(423);
            expect(free.body.code).toBe("LOCK_NOT_HELD");

            hold("owner", mapId, "s-1");
            const headerless = await publish("owner", mapId, null, body);
            expect(headerless.status).toBe(423);
            expect(headerless.body.code).toBe("LOCK_NOT_HELD");
        });

        it("answers 423 MAP_LOCKED to another person's session and to another session of the holder", async () => {
            const { mapId } = await newSpace();
            hold("admin", mapId, "s-admin");
            const body = request(1, [background("#020202")]);

            const stranger = await publish("owner", mapId, "s-owner", body);
            expect(stranger.status).toBe(423);
            expect(stranger.body).toMatchObject({
                code: "MAP_LOCKED",
                by: { id: users.admin.id },
            });
            // Even holding the session string of the other person.
            const stolen = await publish("owner", mapId, "s-admin", body);
            expect(stolen.status).toBe(423);
            expect(stolen.body.code).toBe("LOCK_NOT_HELD");

            core.MapLockService.release(mapId, "s-admin");
            hold("owner", mapId, "s-1");
            const otherTab = await publish("owner", mapId, "s-2", body);
            expect(otherTab.status).toBe(423);
            expect(otherTab.body.code).toBe("MAP_LOCKED");

            const right = await publish("owner", mapId, "s-1", body);
            expect(right.status).toBe(200);
        });
    });

    describe("limits and permissions", () => {
        it("answers 413 OP_TOO_LARGE over the operation limit", async () => {
            const { MAX_PUBLISH_OPS } = await import("@standin/contracts");
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");
            const ops = Array.from({ length: MAX_PUBLISH_OPS + 1 }, () =>
                background("#030303")
            );

            const response = await publish(
                "owner",
                mapId,
                "s-1",
                request(1, ops)
            );

            expect(response.status).toBe(413);
            expect(response.body.code).toBe("OP_TOO_LARGE");
        });

        it("accepts a body above the global limit and refuses one above 5 MB", async () => {
            const { MAX_PUBLISH_BODY_BYTES } =
                await import("@standin/contracts");
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");

            // About 400 KB, over the default 100 KB of the global reader.
            const big = Array.from({ length: 5000 }, () =>
                background("#040404")
            );
            const accepted = await publish(
                "owner",
                mapId,
                "s-1",
                request(1, big)
            );
            expect(accepted.status).toBe(200);

            const huge = await publish("owner", mapId, "s-1", {
                ...request(2, []),
                padding: "x".repeat(MAX_PUBLISH_BODY_BYTES + 1),
            });
            expect(huge.status).toBe(413);
            expect(huge.body.code).toBe("OP_TOO_LARGE");

            // The other routes keep the small global limit.
            const other = await call("owner", "POST", `/maps/${mapId}/assets`, {
                assetId: defs.chair,
                tileX: 1,
                tileY: 1,
                padding: "x".repeat(200 * 1024),
            });
            expect(other.status).toBe(413);
        });

        it("answers 401 without a login, 403 to a reader and 404 to a stranger", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");
            const body = request(1, [background("#050505")]);

            expect((await publish(null, mapId, "s-1", body)).status).toBe(401);
            expect((await publish("member", mapId, "s-1", body)).status).toBe(
                403
            );
            expect((await publish("outsider", mapId, "s-1", body)).status).toBe(
                404
            );
            expect((await publish("owner", "nope", "s-1", body)).status).toBe(
                404
            );
            // Nobody else's attempt touched the map.
            expect((await renderOf("owner", mapId)).map.layoutVersion).toBe(1);
        });

        it("keeps the other write routes locked while the holder publishes", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");

            const response = await call(
                "owner",
                "POST",
                `/maps/${mapId}/assets`,
                { assetId: defs.chair, tileX: 1, tileY: 1 },
                { "x-editor-session": "s-1" }
            );

            expect(response.status).toBe(423);
        });
    });

    describe("socket events", () => {
        const collect = (socket: Socket, events: string[]) => {
            const heard: { event: string; payload: any }[] = [];
            for (const event of events) {
                socket.on(event, (payload) => heard.push({ event, payload }));
            }
            return heard;
        };
        const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

        it("emits map_published and desk_released after the commit, and nothing on failure", async () => {
            const space = await newSpace();
            const watcher = await listen("member");
            watcher.emit("space:join", {
                organizationId,
                spaceId: space.id,
                userId: users.member.id,
            });
            await new Promise((resolve) => setTimeout(resolve, 300));
            const heard = collect(watcher, ["map_published", "desk_released"]);

            // A claimed desk, set up before the map is locked.
            const placed = await call(
                "owner",
                "POST",
                `/maps/${space.mapId}/assets`,
                { assetId: defs.desk, tileX: 8, tileY: 10 }
            );
            const deskId = placed.body.placed[0].id;
            const claimed = await call(
                "member",
                "POST",
                `/spaces/${space.id}/desks/${deskId}/claim`,
                {}
            );
            expect(claimed.status).toBe(200);

            hold("owner", space.mapId, "s-1");
            const version = (await renderOf("owner", space.mapId)).map
                .layoutVersion;

            // Fails: stale base, nothing is emitted.
            const stale = await publish(
                "owner",
                space.mapId,
                "s-1",
                request(version + 5, [background("#060606")])
            );
            expect(stale.status).toBe(409);
            const withoutRelease = await publish(
                "owner",
                space.mapId,
                "s-1",
                request(version, [
                    { type: "remove_asset", id: deskId } as EditorOp,
                ])
            );
            // The replay refuses it first, so the issue is DESK_CLAIMED inside a 422.
            expect(withoutRelease.status).toBe(422);
            expect(withoutRelease.body.errors[0]).toMatchObject({
                opIndex: 0,
                code: "DESK_CLAIMED",
            });
            await settle();
            expect(heard).toEqual([]);

            const response = await publish(
                "owner",
                space.mapId,
                "s-1",
                request(version, [
                    { type: "remove_asset", id: deskId, releaseDesk: true },
                ])
            );
            expect(response.status).toBe(200);
            await settle();

            const published = heard.find(
                ({ event }) => event === "map_published"
            );
            expect(published?.payload).toEqual({
                mapId: space.mapId,
                version: response.body.version,
            });
            const released = heard.filter(
                ({ event }) => event === "desk_released"
            );
            expect(released).toHaveLength(1);
            expect(released[0].payload).toEqual({
                mapAssetId: deskId,
                userId: users.member.id,
            });
        });
    });
});
