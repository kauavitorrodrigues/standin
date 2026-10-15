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

describe.skipIf(!enabled)("decorator publish over HTTP (real stack)", () => {
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
            { name: `Decorator ${RUN} ${counter}`, sizeTier: "XS" }
        );
        return { id: space.id, mapId: space.mapId };
    };

    const hold = (
        as: UserKey,
        mapId: string,
        session: string,
        mode: "map" | "objects" = "objects"
    ) => {
        const result = core.MapLockService.acquire(
            mapId,
            { id: users[as].id, name: as },
            session,
            mode
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

    const decorate = (baseObjectsRevision: string | null, ops: EditorOp[]) => ({
        scope: "objects",
        publishId: crypto.randomUUID(),
        baseObjectsRevision,
        ops,
    });

    const background = (color: string): EditorOp => ({
        type: "set_background",
        color,
    });

    const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

    const collect = (socket: Socket, events: string[]) => {
        const heard: { event: string; payload: any }[] = [];
        for (const event of events) {
            socket.on(event, (payload) => heard.push({ event, payload }));
        }
        return heard;
    };

    // An owner places an object the way the Studio route does, before any lock.
    const place = async (
        mapId: string,
        assetId: string,
        tileX: number,
        tileY: number,
        parentId?: string
    ) => {
        const response = await call("owner", "POST", `/maps/${mapId}/assets`, {
            assetId,
            tileX,
            tileY,
            parentId,
        });
        expect(response.status).toBe(201);
        return response.body.placed[0].id as string;
    };

    const claim = async (
        as: UserKey,
        space: { id: string },
        deskId: string
    ) => {
        const response = await call(
            as,
            "POST",
            `/spaces/${space.id}/desks/${deskId}/claim`,
            {}
        );
        expect(response.status).toBe(200);
    };

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
                    email: `${key}-${RUN}@decorator.dev`,
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
            { name: "Decorator Org" }
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
        await createAsset("vase", { type: "PLANT", placement: "SURFACE" });

        server = http.createServer(createApp());
        createSocketServer(server);
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        sockets.forEach((socket) => socket.disconnect());
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("permission and revision", () => {
        it("tells owner and members they can decorate, and the owner alone can edit", async () => {
            const { mapId } = await newSpace();

            const owner = (await renderOf("owner", mapId)).access;
            const member = (await renderOf("member", mapId)).access;

            expect(owner).toMatchObject({ canEdit: true, canDecorate: true });
            expect(member).toMatchObject({ canEdit: false, canDecorate: true });
            expect(
                (await call("outsider", "GET", `/maps/${mapId}/render`)).status
            ).toBe(404);
        });

        it("does not let anyone decorate a template map", async () => {
            const template = await core.MapTemplateService.create(
                users.admin.id,
                { name: `Tpl ${RUN}`, sizeTier: "XS" } as never
            );
            const access = await core.MapService.getAccess(
                users.admin,
                template.mapId
            );

            expect(access.canEdit).toBe(true);
            expect(access.canDecorate).toBe(false);
        });

        it("moves the objects revision on place, move and remove, and not on tiles", async () => {
            const { mapId } = await newSpace();
            const empty = await renderOf("owner", mapId);
            expect(empty.objectsRevision).toBeNull();

            const id = await place(mapId, defs.chair, 5, 5);
            const placed = (await renderOf("owner", mapId)).objectsRevision;
            expect(typeof placed).toBe("string");

            await settle();
            const moved = await call(
                "owner",
                "PATCH",
                `/maps/${mapId}/assets/${id}`,
                { tileX: 6, tileY: 6 }
            );
            expect(moved.status).toBe(200);
            const afterMove = (await renderOf("owner", mapId)).objectsRevision;
            expect(afterMove > placed).toBe(true);

            await settle();
            hold("owner", mapId, "s-tiles", "map");
            const tiles = await publish("owner", mapId, "s-tiles", {
                publishId: crypto.randomUUID(),
                baseVersion: 1,
                ops: [background("#101010")],
            });
            expect(tiles.status).toBe(200);
            core.MapLockService.release(mapId, "s-tiles");
            expect((await renderOf("owner", mapId)).objectsRevision).toBe(
                afterMove
            );

            await settle();
            const removed = await call(
                "owner",
                "DELETE",
                `/maps/${mapId}/assets/${id}`
            );
            expect(removed.status).toBe(200);
            const afterRemove = (await renderOf("owner", mapId))
                .objectsRevision;
            expect(afterRemove > afterMove).toBe(true);
        });
    });

    describe("what a decorator publish writes", () => {
        it("lets a member place an object, keeps the layout version and tells the room", async () => {
            const space = await newSpace();
            const watcher = await listen("other");
            watcher.emit("space:join", {
                organizationId,
                spaceId: space.id,
                userId: users.other.id,
            });
            await new Promise((resolve) => setTimeout(resolve, 300));
            const heard = collect(watcher, ["objects_published", "map_published"]);
            hold("member", space.mapId, "s-1");

            const response = await publish(
                "member",
                space.mapId,
                "s-1",
                decorate(null, [
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
            expect(response.body.version).toBe(1);
            const render = await renderOf("owner", space.mapId);
            expect(render.map.layoutVersion).toBe(1);
            expect(render.placed).toHaveLength(1);
            expect(response.body.objectsRevision).toBe(render.objectsRevision);

            await settle();
            expect(heard).toEqual([
                {
                    event: "objects_published",
                    payload: {
                        mapId: space.mapId,
                        revision: render.objectsRevision,
                    },
                },
            ]);
        });

        it("lets the owner decorate too", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-1");

            const response = await publish(
                "owner",
                mapId,
                "s-1",
                decorate(null, [
                    {
                        type: "place_asset",
                        tempId: "t",
                        assetId: defs.chair,
                        tileX: 4,
                        tileY: 4,
                    },
                ])
            );

            expect(response.status).toBe(200);
        });

        it("refuses a tile operation with 403 OUT_OF_SCOPE and writes nothing", async () => {
            const { mapId } = await newSpace();
            hold("member", mapId, "s-1");

            const response = await publish(
                "member",
                mapId,
                "s-1",
                decorate(null, [background("#222222")])
            );

            expect(response.status).toBe(403);
            expect(response.body.error).toBe(
                "The draft has an operation outside the edit scope."
            );
            const render = await renderOf("owner", mapId);
            expect(render.map.layoutVersion).toBe(1);
            expect(render.map.layout.backgroundcolor).not.toBe("#222222");
        });

        it("answers 409 STALE_OBJECTS when the objects changed after the draft", async () => {
            const { mapId } = await newSpace();
            const base = (await renderOf("member", mapId)).objectsRevision;
            await place(mapId, defs.chair, 5, 5);
            hold("member", mapId, "s-1");

            const response = await publish(
                "member",
                mapId,
                "s-1",
                decorate(base, [
                    {
                        type: "place_asset",
                        tempId: "t",
                        assetId: defs.chair,
                        tileX: 9,
                        tileY: 9,
                    },
                ])
            );

            expect(response.status).toBe(409);
            expect(response.body.error).toBe(
                "The map objects changed after the draft was created."
            );
            expect((await renderOf("owner", mapId)).placed).toHaveLength(1);
        });

        it("accepts the current revision after a change", async () => {
            const { mapId } = await newSpace();
            await place(mapId, defs.chair, 5, 5);
            const base = (await renderOf("member", mapId)).objectsRevision;
            hold("member", mapId, "s-1");

            const response = await publish(
                "member",
                mapId,
                "s-1",
                decorate(base, [
                    {
                        type: "place_asset",
                        tempId: "t",
                        assetId: defs.chair,
                        tileX: 9,
                        tileY: 9,
                    },
                ])
            );

            expect(response.status).toBe(200);
        });

        it("needs the lock in the objects mode", async () => {
            const { mapId } = await newSpace();
            hold("owner", mapId, "s-studio", "map");
            const body = decorate(null, []);

            expect(
                (await publish("owner", mapId, "s-studio", body)).body.code
            ).toBe("LOCK_NOT_HELD");
            expect((await publish("member", mapId, "s-x", body)).status).toBe(
                423
            );
        });

        it("refuses a person who cannot decorate", async () => {
            const { mapId } = await newSpace();
            hold("member", mapId, "s-1");

            const response = await publish(
                "outsider",
                mapId,
                "s-1",
                decorate(null, [])
            );

            expect(response.status).toBe(404);
        });
    });

    describe("desks", () => {
        it("refuses to touch the desk of someone else, or what is on it", async () => {
            const space = await newSpace();
            const deskId = await place(space.mapId, defs.desk, 8, 10);
            const vaseId = await place(space.mapId, defs.vase, 8, 10, deskId);
            await claim("member", space, deskId);
            const base = (await renderOf("other", space.mapId)).objectsRevision;
            hold("other", space.mapId, "s-1");

            const attempts: EditorOp[] = [
                { type: "move_asset", id: deskId, tileX: 12, tileY: 12 },
                { type: "replace_asset", id: deskId, assetId: defs.desk },
                { type: "remove_asset", id: deskId, releaseDesk: true },
                { type: "remove_asset", id: vaseId },
            ];
            for (const op of attempts) {
                const response = await publish(
                    "other",
                    space.mapId,
                    "s-1",
                    decorate(base, [op])
                );
                expect(response.status).toBe(409);
                expect(response.body.error).toBe(
                    "This desk has an owner. Confirm the release to delete it."
                );
            }

            const render = await renderOf("owner", space.mapId);
            expect(render.placed).toHaveLength(2);
            expect(render.desks).toHaveLength(1);
        });

        it("lets the owner of the desk move it and what is on it", async () => {
            const space = await newSpace();
            const deskId = await place(space.mapId, defs.desk, 8, 10);
            await place(space.mapId, defs.vase, 8, 10, deskId);
            await claim("member", space, deskId);
            const base = (await renderOf("member", space.mapId)).objectsRevision;
            hold("member", space.mapId, "s-1");

            const response = await publish(
                "member",
                space.mapId,
                "s-1",
                decorate(base, [
                    { type: "move_asset", id: deskId, tileX: 12, tileY: 12 },
                ])
            );

            expect(response.status).toBe(200);
            const render = await renderOf("owner", space.mapId);
            expect(render.desks).toHaveLength(1);
            expect(
                render.placed.find(({ id }: { id: string }) => id === deskId)
            ).toMatchObject({ tileX: 12, tileY: 12 });
        });

        it("frees the own desk when it is removed with releaseDesk, items go too, and tells the room", async () => {
            const space = await newSpace();
            const deskId = await place(space.mapId, defs.desk, 8, 10);
            await place(space.mapId, defs.vase, 8, 10, deskId);
            await claim("member", space, deskId);
            const watcher = await listen("other");
            watcher.emit("space:join", {
                organizationId,
                spaceId: space.id,
                userId: users.other.id,
            });
            await new Promise((resolve) => setTimeout(resolve, 300));
            const heard = collect(watcher, ["desk_released", "objects_published"]);
            const base = (await renderOf("member", space.mapId)).objectsRevision;
            hold("member", space.mapId, "s-1");

            const without = await publish(
                "member",
                space.mapId,
                "s-1",
                decorate(base, [{ type: "remove_asset", id: deskId }])
            );
            expect(without.status).toBe(409);

            const response = await publish(
                "member",
                space.mapId,
                "s-1",
                decorate(base, [
                    { type: "remove_asset", id: deskId, releaseDesk: true },
                ])
            );

            expect(response.status).toBe(200);
            const render = await renderOf("owner", space.mapId);
            expect(render.placed).toEqual([]);
            expect(render.desks).toEqual([]);
            expect(render.access.ownDeskMapAssetId).toBeNull();
            expect(render.map.layoutVersion).toBe(1);

            await settle();
            expect(heard.map(({ event }) => event).sort()).toEqual([
                "desk_released",
                "objects_published",
            ]);
            expect(
                heard.find(({ event }) => event === "desk_released")?.payload
            ).toEqual({ mapAssetId: deskId, userId: users.member.id });
        });

        it("refuses a publish that removes a desk claimed after the draft was made", async () => {
            const space = await newSpace();
            const deskId = await place(space.mapId, defs.desk, 8, 10);
            const base = (await renderOf("other", space.mapId)).objectsRevision;
            hold("other", space.mapId, "s-1");

            // The claim goes through while the decorator is open.
            await claim("member", space, deskId);

            const response = await publish(
                "other",
                space.mapId,
                "s-1",
                decorate(base, [{ type: "remove_asset", id: deskId }])
            );

            expect(response.status).toBe(409);
            expect((await renderOf("owner", space.mapId)).placed).toHaveLength(1);
        });
    });

    describe("locks around the decorator", () => {
        it("keeps claim, release and assign open, and the object routes closed, while a decorator is open", async () => {
            const space = await newSpace();
            const deskId = await place(space.mapId, defs.desk, 8, 10);
            hold("member", space.mapId, "s-1");

            const objectRoute = await call(
                "owner",
                "POST",
                `/maps/${space.mapId}/assets`,
                { assetId: defs.chair, tileX: 1, tileY: 1 }
            );
            expect(objectRoute.status).toBe(423);

            const claimed = await call(
                "other",
                "POST",
                `/spaces/${space.id}/desks/${deskId}/claim`,
                {}
            );
            expect(claimed.status).toBe(200);
            const released = await call(
                "other",
                "DELETE",
                `/spaces/${space.id}/desks/${deskId}/claim`
            );
            expect(released.status).toBe(200);
            const assigned = await call(
                "owner",
                "POST",
                `/spaces/${space.id}/desks/${deskId}/assign`,
                { userId: users.member.id }
            );
            expect(assigned.status).toBe(200);
        });

        it("blocks claim, release and assign while the Studio is open", async () => {
            const space = await newSpace();
            const deskId = await place(space.mapId, defs.desk, 8, 10);
            hold("owner", space.mapId, "s-studio", "map");

            const claimed = await call(
                "other",
                "POST",
                `/spaces/${space.id}/desks/${deskId}/claim`,
                {}
            );

            expect(claimed.status).toBe(423);
        });

        it("refuses a second decorator and lets the Studio push the first one out", async () => {
            const { mapId } = await newSpace();
            hold("member", mapId, "s-1");

            const second = core.MapLockService.acquire(
                mapId,
                { id: users.other.id, name: "other" },
                "s-2",
                "objects"
            );
            expect(second).toMatchObject({ ok: false, mode: "objects" });

            const studio = core.MapLockService.acquire(
                mapId,
                { id: users.owner.id, name: "owner" },
                "s-studio",
                "map"
            );
            expect(studio).toMatchObject({
                ok: true,
                preemptedSessionId: "s-1",
            });

            const dropped = await publish(
                "member",
                mapId,
                "s-1",
                decorate(null, [])
            );
            expect(dropped.status).toBe(423);
            expect(dropped.body.code).toBe("MAP_LOCKED");
        });

        it("reports the mode on GET /maps/:mapId/lock", async () => {
            const { mapId } = await newSpace();
            hold("member", mapId, "s-1");

            const response = await call("other", "GET", `/maps/${mapId}/lock`);

            expect(response.body).toMatchObject({
                locked: true,
                by: { id: users.member.id },
                mode: "objects",
            });
        });
    });
});
