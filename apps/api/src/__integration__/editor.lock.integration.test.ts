import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { io as connectClient, type Socket } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Two people on the same space map, with real sockets and the real Express
// stack, against a real Postgres. Off unless INTEGRATION_DATABASE_URL points
// at a throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type UserKey = "admin" | "admin2" | "a" | "b";
type Ack = Record<string, any>;

describe.skipIf(!enabled)("editor lock with two sessions (real stack)", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let stopSweeper: () => void;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: "ADMIN" | "USER" }>;
    let organizationId: string;
    let space: { id: string; mapId: string };
    let deskRowId: string;
    const sockets: Socket[] = [];

    // Distinct per run, so a leftover lock of another run can never match.
    const SESSION_A1 = `a1-${RUN}`;
    const SESSION_A2 = `a2-${RUN}`;
    const SESSION_B = `b-${RUN}`;

    const call = async (
        as: UserKey,
        method: string,
        route: string,
        body?: unknown,
        extraHeaders: Record<string, string> = {}
    ) => {
        const headers: Record<string, string> = {
            ...extraHeaders,
            cookie: `token=${createToken(users[as])}`,
        };
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

    const connect = (as: UserKey): Promise<Socket> =>
        new Promise((resolve, reject) => {
            const socket = connectClient(baseUrl, {
                auth: { token: createToken(users[as]) },
                transports: ["websocket"],
            });
            sockets.push(socket);
            socket.on("connect", () => resolve(socket));
            socket.on("connect_error", reject);
        });

    // One connection per person, joined to the space room. Registers the
    // listener before the emit, so the event cannot be missed.
    const joinSpace = async (as: UserKey): Promise<Socket> => {
        const socket = await connect(as);
        const joined = new Promise((resolve) =>
            socket.once("space:joined", resolve)
        );
        socket.emit("space:join", {
            organizationId,
            spaceId: space.id,
            userId: users[as].id,
        });
        await joined;
        return socket;
    };

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

    // Resolves true if the event shows up in the window, false otherwise.
    const heardWithin = (socket: Socket, event: string, ms: number) =>
        new Promise<boolean>((resolve) => {
            const handler = () => {
                clearTimeout(timer);
                resolve(true);
            };
            const timer = setTimeout(() => {
                socket.off(event, handler);
                resolve(false);
            }, ms);
            socket.once(event, handler);
        });

    const acquire = (
        socket: Socket,
        sessionId: string,
        mapId = space.mapId
    ): Promise<Ack> =>
        socket.timeout(2000).emitWithAck("editor:acquire", { mapId, sessionId });

    const heartbeat = (
        socket: Socket,
        sessionId: string,
        mapId = space.mapId
    ): Promise<Ack> =>
        socket.timeout(2000).emitWithAck("editor:heartbeat", { mapId, sessionId });

    const release = (
        socket: Socket,
        sessionId: string,
        mapId = space.mapId
    ): Promise<Ack> =>
        socket.timeout(2000).emitWithAck("editor:release", { mapId, sessionId });

    const currentVersion = async () =>
        (await call("a", "GET", `/maps/${space.mapId}/render`)).body.map
            .layoutVersion as number;

    const publish = (
        as: UserKey,
        baseVersion: number,
        session?: string,
        color = "#112233"
    ) =>
        call(
            as,
            "POST",
            `/maps/${space.mapId}/publish`,
            {
                publishId: crypto.randomUUID(),
                baseVersion,
                ops: [{ type: "set_background", color }],
            },
            session ? { "x-editor-session": session } : {}
        );

    beforeAll(async () => {
        // Only Date is faked, and before the core loads: the lock service
        // keeps the Date.now it sees at creation, so a later clock jump
        // reaches it. Timers and the network stay real.
        vi.useFakeTimers({ toFake: ["Date"], now: Date.now() });

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
        const { startLockSweeper } = await import("@/lib/socket/startLockSweeper");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { db, usersTable, organizationMembersTable } = database;

        const make = async (key: UserKey, role: "ADMIN" | "USER") => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@editor-lock.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("a", "USER");
        await make("b", "USER");
        await make("admin2", "ADMIN");

        // Only the single owner of an organization can edit a space map, so
        // B is a plain member of the space.
        const organization = await core.OrganizationService.create(
            users.a.id,
            { name: `Lock Org ${RUN}` }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values({
            userId: users.b.id,
            organizationId,
            role: "MEMBER",
        });

        server = http.createServer(createApp());
        createSocketServer(server);
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

        const created = await call(
            "a",
            "POST",
            `/organizations/${organizationId}/spaces`,
            { name: "Sala", sizeTier: "XS" }
        );
        space = { id: created.body.space.id, mapId: created.body.mapId };

        // A desk to claim, placed while the map is still free.
        const asset = await core.AssetService.createAsset(
            {
                buffer: core.encodePng(
                    64,
                    32,
                    Array.from({ length: 64 * 32 }, () => [5, 5, 5, 255])
                ),
            },
            {
                key: `lock-desk-${RUN}`,
                name: "desk",
                type: "DESK",
                category: "ROOM_DECOR",
                footprint: { w: 2, h: 1 },
                solid: true,
            },
            { organizationId: null, createdBy: users.admin.id }
        );
        const placed = await call("a", "POST", `/maps/${space.mapId}/assets`, {
            assetId: asset.id,
            tileX: 5,
            tileY: 5,
        });
        expect(placed.status).toBe(201);
        deskRowId = placed.body.placed[0].id;

        stopSweeper = startLockSweeper(25);
    });

    afterAll(async () => {
        stopSweeper?.();
        // Leaves nothing held on the map for whatever runs next.
        if (space) {
            for (const session of [SESSION_A1, SESSION_A2, SESSION_B]) {
                core.MapLockService.release(space.mapId, session);
            }
        }
        sockets.forEach((socket) => socket.disconnect());
        await new Promise((resolve) => server?.close(resolve));
        vi.useRealTimers();
    });

    it("runs the lock life of a space map between its owner and a member", async () => {
        const socketA = await joinSpace("a");
        const socketB = await joinSpace("b");
        // A second tab of A. It does not join the space room: joining twice
        // as the same person would kick the first tab out.
        const socketA2 = await connect("a");

        // A takes the lock and everyone in the room is told.
        const lockedForB = nextEvent<{ mapId: string; by: any; since: string }>(
            socketB,
            "map_locked"
        );
        const granted = await acquire(socketA, SESSION_A1);
        expect(granted).toEqual({
            ok: true,
            heartbeatMs: 15000,
            ttlMs: 45000,
        });
        const locked = await lockedForB;
        expect(locked.mapId).toBe(space.mapId);
        expect(locked.by).toEqual({ id: users.a.id, name: "a" });
        expect(Number.isNaN(Date.parse(locked.since))).toBe(false);

        // B cannot edit a space map, so asking is refused as FORBIDDEN, not
        // as MAP_LOCKED. The denial with by and since is the template test.
        expect(await acquire(socketB, SESSION_B)).toEqual({
            ok: false,
            code: "FORBIDDEN",
        });

        // B cannot claim a desk while the map is locked.
        const claim = await call(
            "b",
            "POST",
            `/spaces/${space.id}/desks/${deskRowId}/claim`,
            {}
        );
        expect(claim.status).toBe(423);
        expect(claim.body).toMatchObject({
            code: "MAP_LOCKED",
            by: { id: users.a.id },
        });

        // Publishing: only the session that holds the lock gets through.
        const version = await currentVersion();
        expect((await publish("a", version, `wrong-${RUN}`)).status).toBe(423);
        expect((await publish("a", version)).status).toBe(423);

        const publishedForB = nextEvent<{ mapId: string; version: number }>(
            socketB,
            "map_published"
        );
        const published = await publish("a", version, SESSION_A1);
        expect(published.status).toBe(200);
        expect(published.body.version).toBe(version + 1);
        expect(await publishedForB).toEqual({
            mapId: space.mapId,
            version: version + 1,
        });

        // The old base version is stale, even for the right session.
        const stale = await publish("a", version, SESSION_A1);
        expect(stale.status).toBe(409);
        expect(stale.body).toMatchObject({ code: "STALE_LAYOUT_VERSION" });
        // The lock stays with A after publishing.
        expect(
            (await call("b", "GET", `/maps/${space.mapId}/lock`)).body.locked
        ).toBe(true);

        // The same person in a second session takes over, and the first one
        // is told it lost the lock.
        const lostA1 = nextEvent<{ mapId: string }>(
            socketA,
            "editor:lock_lost"
        );
        const takeover = await acquire(socketA2, SESSION_A2);
        expect(takeover.ok).toBe(true);
        expect(await lostA1).toEqual({ mapId: space.mapId });
        // The first session no longer holds anything.
        expect((await heartbeat(socketA, SESSION_A1)).ok).toBe(false);
        expect((await heartbeat(socketA2, SESSION_A2)).ok).toBe(true);
        expect((await publish("a", version + 1, SESSION_A1)).status).toBe(423);

        // Leaving frees the lock and the room hears it.
        const unlockedForB = nextEvent<{ mapId: string }>(
            socketB,
            "map_unlocked"
        );
        expect((await release(socketA2, SESSION_A2)).ok).toBe(true);
        expect(await unlockedForB).toEqual({ mapId: space.mapId });
        // Releasing again, or heartbeating after, is refused.
        expect((await release(socketA2, SESSION_A2)).ok).toBe(false);
        expect((await heartbeat(socketA2, SESSION_A2)).ok).toBe(false);
        // With the lock free, B can claim the desk again.
        const claimed = await call(
            "b",
            "POST",
            `/spaces/${space.id}/desks/${deskRowId}/claim`,
            {}
        );
        expect(claimed.status).toBe(200);
        await call("b", "DELETE", `/spaces/${space.id}/desks/${deskRowId}/claim`);

        // Expiry. A stops heartbeating, the clock jumps past the TTL and the
        // sweeper removes the lock.
        expect((await acquire(socketA, SESSION_A1)).ok).toBe(true);
        const unlockedAfterExpiry = nextEvent<{ mapId: string }>(
            socketB,
            "map_unlocked"
        );
        const lostAfterExpiry = nextEvent<{ mapId: string }>(
            socketA,
            "editor:lock_lost"
        );
        vi.setSystemTime(Date.now() + 46_000);
        expect(await unlockedAfterExpiry).toEqual({ mapId: space.mapId });
        expect(await lostAfterExpiry).toEqual({ mapId: space.mapId });
        expect(
            (await call("b", "GET", `/maps/${space.mapId}/lock`)).body
        ).toEqual({ locked: false });
        expect((await heartbeat(socketA, SESSION_A1)).ok).toBe(false);

        // After expiry A acquires again and publishes with the new hold.
        expect((await acquire(socketA, SESSION_A1)).ok).toBe(true);
        expect((await release(socketA, SESSION_A1)).ok).toBe(true);
    });

    it("denies a second admin on a template map with by and since", async () => {
        const created = await call("admin", "POST", "/templates", {
            name: `Lock Template ${RUN}`,
            sizeTier: "XS",
        });
        expect(created.status).toBe(201);
        const mapId: string = created.body.mapId;
        const templateId: string = created.body.templateId;

        try {
            const first = await connect("admin");
            const second = await connect("admin2");
            first.emit("map:join", { mapId });
            second.emit("map:join", { mapId });
            await new Promise((resolve) => setTimeout(resolve, 300));

            const lockedForSecond = nextEvent<{ by: any; since: string }>(
                second,
                "map_locked"
            );
            expect((await acquire(first, SESSION_A1, mapId)).ok).toBe(true);
            const locked = await lockedForSecond;
            expect(locked.by.id).toBe(users.admin.id);

            expect(await acquire(second, SESSION_B, mapId)).toMatchObject({
                ok: false,
                code: "MAP_LOCKED",
                by: { id: users.admin.id, name: "admin" },
                since: locked.since,
            });
            // The other admin cannot publish either.
            const refused = await call(
                "admin2",
                "POST",
                `/maps/${mapId}/publish`,
                {
                    publishId: crypto.randomUUID(),
                    baseVersion: 1,
                    ops: [{ type: "set_background", color: "#445566" }],
                },
                { "x-editor-session": SESSION_B }
            );
            expect(refused.status).toBe(423);
            expect(refused.body).toMatchObject({ code: "MAP_LOCKED" });

            const unlocked = nextEvent<{ mapId: string }>(
                second,
                "map_unlocked"
            );
            expect((await release(first, SESSION_A1, mapId)).ok).toBe(true);
            expect(await unlocked).toEqual({ mapId });
            expect((await acquire(second, SESSION_B, mapId)).ok).toBe(true);
            expect((await release(second, SESSION_B, mapId)).ok).toBe(true);
        } finally {
            core.MapLockService.release(mapId, SESSION_A1);
            core.MapLockService.release(mapId, SESSION_B);
            await call("admin", "DELETE", `/templates/${templateId}`);
        }
    });
});
