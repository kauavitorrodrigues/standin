import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import { io as connectClient, type Socket as ClientSocket } from "socket.io-client";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { resolveJoinAccessMock } = vi.hoisted(() => ({
    resolveJoinAccessMock: vi.fn(),
}));

// Members are hosts: they hear the requests of guests, none here.
vi.mock("@standin/core", () => ({
    SpaceGuestService: { listPending: async () => [] },
    AvatarService: { ensureSheetUpToDate: async () => null },
}));
vi.mock("../../services/resolveJoinAccess", () => ({
    resolveJoinAccess: resolveJoinAccessMock,
}));

import { registerJoinSpace } from "../joinSpace";
import { registerDisconnect } from "../disconnect";
import { registerRoomCrossed } from "../roomCrossed";
import { registerRoomOpen } from "../roomOpen";
import { registerRoomPresent } from "../roomPresent";
import { registerRoomLock } from "../roomLock";
import { registerRoomUnlock } from "../roomUnlock";
import { RoomStates } from "../../utils/roomStates";

type RoomMsg = { roomKey: string; state: string };

// Real socket.io server and clients over a local port, with the real room
// handlers. Only the auth middleware and the space permission check are stubbed.
describe("room doors with several clients in a space", () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: Server;
    let port: number;
    let clients: Client[] = [];

    class Client {
        socket: ClientSocket;
        states: RoomMsg[] = [];
        snapshots: { rooms: RoomMsg[] }[] = [];

        constructor(readonly userId: string) {
            this.socket = connectClient(`http://localhost:${port}`, {
                auth: { userId },
                forceNew: true,
                transports: ["websocket"],
            });
            this.socket.on("room:state", (m: RoomMsg) => this.states.push(m));
            this.socket.on("room:states", (m: { rooms: RoomMsg[] }) =>
                this.snapshots.push(m)
            );
            clients.push(this);
        }

        async join(spaceId: string) {
            const before = this.snapshots.length;
            if (!this.socket.connected) {
                await new Promise<void>((r) => this.socket.once("connect", () => r()));
            }
            this.socket.emit("space:join", { spaceId });
            await vi.waitFor(() => expect(this.snapshots.length).toBe(before + 1));
            return this;
        }

        send(event: string, payload: unknown) {
            this.socket.emit(event, payload);
        }
    }

    const connect = (userId: string) => new Client(userId);
    // Events travel in order over one connection, so a round trip on a probe
    // client proves everything sent before has been handled and delivered.
    const settle = () => new Promise((r) => setTimeout(r, 80));

    beforeAll(async () => {
        httpServer = createServer();
        io = new Server(httpServer);
        io.use((socket, next) => {
            socket.data.userId = socket.handshake.auth.userId;
            socket.data.spaceId = null;
            next();
        });
        io.on("connection", (socket) => {
            registerJoinSpace(io, socket);
            registerRoomCrossed(io, socket);
            registerRoomOpen(io, socket);
            registerRoomPresent(io, socket);
            registerRoomLock(io, socket);
            registerRoomUnlock(io, socket);
            registerDisconnect(socket);
        });
        await new Promise<void>((r) => httpServer.listen(0, r));
        port = (httpServer.address() as AddressInfo).port;
    });

    afterAll(async () => {
        await io.close();
    });

    beforeEach(() => {
        RoomStates.clear();
        resolveJoinAccessMock.mockResolvedValue({ isHost: true, isOwner: false });
    });

    const cleanup = () => {
        clients.forEach((c) => c.socket.close());
        clients = [];
    };

    const setup = async (spaceId = "s1", ...ids: string[]) => {
        const out: Client[] = [];
        for (const id of ids) out.push(await connect(id).join(spaceId));
        return out;
    };

    const room = "media";

    it("runs the full multi-client door flow", async () => {
        const [a, b] = await setup("s1", "a", "b");

        // A crosses IN: closed for everyone.
        a.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => {
            expect(a.states).toEqual([{ roomKey: room, state: "closed" }]);
            expect(b.states).toEqual([{ roomKey: room, state: "closed" }]);
        });

        // B outside tries to lock: only B is corrected.
        b.send("room:lock", { roomKey: room });
        await vi.waitFor(() => expect(b.states).toHaveLength(2));
        await settle();
        expect(b.states[1]).toEqual({ roomKey: room, state: "closed" });
        expect(a.states).toHaveLength(1);

        // A locks: all receive locked.
        a.send("room:lock", { roomKey: room });
        await vi.waitFor(() => {
            expect(a.states.at(-1)).toEqual({ roomKey: room, state: "locked" });
            expect(b.states.at(-1)).toEqual({ roomKey: room, state: "locked" });
        });

        // B tries to enter while locked: refused, only B told.
        const aCount = a.states.length;
        const bCount = b.states.length;
        b.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(b.states).toHaveLength(bCount + 1));
        await settle();
        expect(b.states.at(-1)).toEqual({ roomKey: room, state: "locked" });
        expect(a.states).toHaveLength(aCount);

        // B forges an OUT while locked and was never inside: refused.
        b.send("room:crossed", { roomKey: room, direction: "out" });
        await vi.waitFor(() => expect(b.states).toHaveLength(bCount + 2));
        await settle();
        expect(b.states.at(-1)).toEqual({ roomKey: room, state: "locked" });
        expect(a.states).toHaveLength(aCount);

        // A crosses OUT of the locked room: opens for everyone.
        a.send("room:crossed", { roomKey: room, direction: "out" });
        await vi.waitFor(() => {
            expect(a.states.at(-1)).toEqual({ roomKey: room, state: "open" });
            expect(b.states.at(-1)).toEqual({ roomKey: room, state: "open" });
        });
        cleanup();
    });

    it("keeps the room when one of two inside disconnects", async () => {
        const [a, b, c] = await setup("s1", "a", "b", "c");
        a.send("room:crossed", { roomKey: room, direction: "in" });
        b.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(c.states).toHaveLength(1));
        a.send("room:lock", { roomKey: room });
        await vi.waitFor(() =>
            expect(c.states.at(-1)).toEqual({ roomKey: room, state: "locked" })
        );
        const count = c.states.length;

        a.socket.close();
        await settle();
        expect(c.states).toHaveLength(count);
        expect(RoomStates.listNotOpen("s1")).toEqual([{ roomKey: room, state: "locked" }]);

        // The last one inside leaves: the locked room opens.
        b.socket.close();
        await vi.waitFor(() =>
            expect(c.states.at(-1)).toEqual({ roomKey: room, state: "open" })
        );
        expect(RoomStates.listNotOpen("s1")).toEqual([]);
        cleanup();
    });

    it("sends the non open rooms to a client that joins later", async () => {
        const [a] = await setup("s1", "a");
        a.send("room:crossed", { roomKey: "media", direction: "in" });
        a.send("room:crossed", { roomKey: "boss", direction: "in" });
        a.send("room:lock", { roomKey: "boss" });
        a.send("room:crossed", { roomKey: "lounge", direction: "in" });
        a.send("room:crossed", { roomKey: "lounge", direction: "out" });
        await vi.waitFor(() => expect(a.states).toHaveLength(5));

        const late = await connect("late").join("s1");
        const rooms = late.snapshots[0].rooms;
        expect(rooms).toHaveLength(2);
        expect(rooms).toEqual(
            expect.arrayContaining([
                { roomKey: "media", state: "closed" },
                { roomKey: "boss", state: "locked" },
            ])
        );
        cleanup();
    });

    it("never leaks events across spaces", async () => {
        const [a, b] = await setup("s1", "a", "b");
        const [x] = await setup("s2", "x");
        a.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(b.states).toHaveLength(1));
        await settle();
        expect(x.states).toEqual([]);
        expect(x.snapshots[0].rooms).toEqual([]);

        // Same roomKey in space 2 is independent and not locked out.
        x.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(x.states).toHaveLength(1));
        await settle();
        expect(a.states).toHaveLength(1);
        expect(b.states).toHaveLength(1);

        // A disconnect in space 2 tells nobody in space 1.
        x.socket.close();
        await settle();
        expect(a.states).toHaveLength(1);
        cleanup();
    });

    it("keeps two rooms of one space independent", async () => {
        const [a, b] = await setup("s1", "a", "b");
        a.send("room:crossed", { roomKey: "r1", direction: "in" });
        a.send("room:lock", { roomKey: "r1" });
        b.send("room:crossed", { roomKey: "r2", direction: "in" });
        await vi.waitFor(() => expect(a.states).toHaveLength(3));

        // B inside r2 cannot unlock r1, and entering r2 was not blocked by r1.
        b.send("room:unlock", { roomKey: "r1" });
        await vi.waitFor(() => expect(b.states).toHaveLength(4));
        expect(b.states.at(-1)).toEqual({ roomKey: "r1", state: "locked" });

        b.send("room:crossed", { roomKey: "r2", direction: "out" });
        await vi.waitFor(() =>
            expect(a.states.at(-1)).toEqual({ roomKey: "r2", state: "open" })
        );
        expect(RoomStates.listNotOpen("s1")).toEqual([{ roomKey: "r1", state: "locked" }]);
        cleanup();
    });

    it("lets an avatar that spawned inside a locked room unlock it", async () => {
        const [a, b] = await setup("s1", "a", "b");
        a.send("room:crossed", { roomKey: room, direction: "in" });
        a.send("room:lock", { roomKey: room });
        await vi.waitFor(() => expect(b.states.at(-1)?.state).toBe("locked"));

        // C reloads inside the locked room: present adds it, nothing changes.
        const c = await connect("c").join("s1");
        expect(c.snapshots[0].rooms).toEqual([{ roomKey: room, state: "locked" }]);
        c.send("room:present", { roomKey: room });
        await vi.waitFor(() => expect(c.states).toEqual([{ roomKey: room, state: "locked" }]));
        expect(b.states.at(-1)).toEqual({ roomKey: room, state: "locked" });

        c.send("room:unlock", { roomKey: room });
        await vi.waitFor(() => {
            expect(a.states.at(-1)).toEqual({ roomKey: room, state: "closed" });
            expect(b.states.at(-1)).toEqual({ roomKey: room, state: "closed" });
        });
        cleanup();
    });
});
