import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import { io as connectClient, type Socket as ClientSocket } from "socket.io-client";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { resolveJoinAccessMock } = vi.hoisted(() => ({
    resolveJoinAccessMock: vi.fn(),
}));

// Members are hosts: they hear the requests of guests, none here.
vi.mock("@standin/core", () => ({
    SpaceGuestService: { listPending: async () => [] },
}));
vi.mock("../../services/resolveJoinAccess", () => ({
    resolveJoinAccess: resolveJoinAccessMock,
}));

import { registerJoinSpace } from "../joinSpace";
import { registerDisconnect } from "../disconnect";
import { registerRoomCrossed } from "../roomCrossed";
import { registerRoomLock } from "../roomLock";
import { registerRoomUnlock } from "../roomUnlock";
import { registerRoomJoinRequest } from "../roomJoinRequest";
import { registerRoomJoinAnswer } from "../roomJoinAnswer";
import { RoomStates } from "../../utils/roomStates";

type Msg = Record<string, unknown>;
const room = "media";

describe("request to join a locked room with several clients", () => {
    let httpServer: ReturnType<typeof createServer>;
    let io: Server;
    let port: number;
    let clients: Client[] = [];

    class Client {
        socket: ClientSocket;
        states: Msg[] = [];
        requested: Msg[] = [];
        cancelled: Msg[] = [];
        decisions: Msg[] = [];
        entitlements: Msg[] = [];
        joined = 0;

        constructor(readonly userId: string) {
            this.socket = connectClient(`http://localhost:${port}`, {
                auth: { userId },
                forceNew: true,
                transports: ["websocket"],
            });
            this.socket.on("room:state", (m: Msg) => this.states.push(m));
            this.socket.on("room:states", () => this.joined++);
            this.socket.on("room:join-requested", (m: Msg) => this.requested.push(m));
            this.socket.on("room:join-cancelled", (m: Msg) => this.cancelled.push(m));
            this.socket.on("room:join-decision", (m: Msg) => this.decisions.push(m));
            this.socket.on("room:entitlements", (m: Msg) => this.entitlements.push(m));
            clients.push(this);
        }

        async join(spaceId = "s1") {
            const before = this.joined;
            if (!this.socket.connected) {
                await new Promise<void>((r) => this.socket.once("connect", () => r()));
            }
            this.socket.emit("space:join", { spaceId });
            await vi.waitFor(() => expect(this.joined).toBe(before + 1));
            await vi.waitFor(() => expect(this.entitlements.length).toBeGreaterThan(0));
            return this;
        }

        send(event: string, payload: unknown) {
            this.socket.emit(event, payload);
        }

        lastState() {
            return this.states.at(-1)?.state;
        }
    }

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
            registerRoomLock(io, socket);
            registerRoomUnlock(io, socket);
            registerRoomJoinRequest(io, socket);
            registerRoomJoinAnswer(io, socket);
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
        resolveJoinAccessMock.mockImplementation(async (userId: string) => ({
            isHost: true,
            isOwner: userId === "owner",
        }));
    });

    afterEach(() => {
        clients.forEach((c) => c.socket.close());
        clients = [];
    });

    // A is inside a room locked by A.
    const lockedByA = async (...others: string[]) => {
        const a = await new Client("a").join();
        const rest: Client[] = [];
        for (const id of others) rest.push(await new Client(id).join());
        a.send("room:crossed", { roomKey: room, direction: "in" });
        a.send("room:lock", { roomKey: room });
        await vi.waitFor(() => expect(rest.every((c) => c.lastState() === "locked")).toBe(true));
        return [a, ...rest];
    };

    it("sends entitlements on join and never refuses the owner", async () => {
        const [a] = await lockedByA();
        const owner = await new Client("owner").join();
        expect(owner.entitlements[0]).toEqual({ all: true, roomKeys: [] });
        expect(a.entitlements[0]).toEqual({ all: false, roomKeys: [] });

        owner.send("room:crossed", { roomKey: room, direction: "in" });
        owner.send("room:join-request", { roomKey: room });
        await settle();
        // Accepted and unchanged: nothing refuses the owner and the room stays locked.
        expect(owner.states).toEqual([]);
        expect(a.lastState()).toBe("locked");
        expect(a.requested).toEqual([]);
    });

    it("lets an accepted user cross in, leave and come back, but not others", async () => {
        const [a, b, c] = await lockedByA("b", "c");
        b.send("room:join-request", { roomKey: room });
        await vi.waitFor(() => expect(a.requested).toEqual([{ roomKey: room, userId: "b" }]));
        b.send("room:join-request", { roomKey: room });
        await settle();
        expect(a.requested).toHaveLength(1);
        expect(c.requested).toEqual([]);

        a.send("room:join-answer", { roomKey: room, userId: "b", accept: true });
        await vi.waitFor(() => {
            expect(b.decisions).toEqual([{ roomKey: room, accepted: true }]);
            expect(b.entitlements.at(-1)).toEqual({ all: false, roomKeys: [room] });
            expect(a.cancelled).toEqual([{ roomKey: room, userId: "b" }]);
        });

        b.send("room:crossed", { roomKey: room, direction: "in" });
        await settle();
        expect(a.lastState()).toBe("locked");
        b.send("room:crossed", { roomKey: room, direction: "out" });
        await vi.waitFor(() => expect(a.lastState()).toBe("open"));
        a.send("room:lock", { roomKey: room });
        await vi.waitFor(() => expect(a.lastState()).toBe("locked"));
        b.send("room:crossed", { roomKey: room, direction: "in" });
        await settle();
        expect(RoomStates.cross("s1", room, "x", "b", "in").accepted).toBe(true);

        c.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(c.lastState()).toBe("locked"));
        expect(c.states.at(-1)).toEqual({ roomKey: room, state: "locked" });
    });

    it("leaves the requester out when declined", async () => {
        const [a, b] = await lockedByA("b");
        b.send("room:join-request", { roomKey: room });
        await vi.waitFor(() => expect(a.requested).toHaveLength(1));
        a.send("room:join-answer", { roomKey: room, userId: "b", accept: false });
        await vi.waitFor(() => expect(b.decisions).toEqual([{ roomKey: room, accepted: false }]));
        expect(b.entitlements).toHaveLength(1);
        b.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(b.states.at(-1)).toEqual({ roomKey: room, state: "locked" }));
    });

    it("ends the meeting when everyone leaves and B must ask again", async () => {
        const [a, b] = await lockedByA("b");
        b.send("room:join-request", { roomKey: room });
        await vi.waitFor(() => expect(a.requested).toHaveLength(1));
        a.send("room:join-answer", { roomKey: room, userId: "b", accept: true });
        await vi.waitFor(() => expect(b.entitlements.at(-1)?.roomKeys).toEqual([room]));

        a.send("room:crossed", { roomKey: room, direction: "out" });
        await vi.waitFor(() => expect(b.lastState()).toBe("open"));
        await vi.waitFor(() =>
            expect(b.entitlements.at(-1)).toEqual({ all: false, roomKeys: [] })
        );

        b.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(b.lastState()).toBe("closed"));
        b.send("room:lock", { roomKey: room });
        await vi.waitFor(() => expect(b.lastState()).toBe("locked"));
        a.send("room:join-request", { roomKey: room });
        await vi.waitFor(() => expect(b.requested).toEqual([{ roomKey: room, userId: "a" }]));
    });

    it("cancels a request when the requester disconnects", async () => {
        const [a, b] = await lockedByA("b");
        b.send("room:join-request", { roomKey: room });
        await vi.waitFor(() => expect(a.requested).toHaveLength(1));
        b.socket.close();
        await vi.waitFor(() => expect(a.cancelled).toEqual([{ roomKey: room, userId: "b" }]));
    });

    it("counts only the first answer when two are inside", async () => {
        const [a, b, c] = await lockedByA("b", "c");
        c.send("room:crossed", { roomKey: room, direction: "in" });
        await vi.waitFor(() => expect(c.lastState()).toBe("locked"));
        // C is not entitled, so put C inside through the store as a second member.
        RoomStates.present("s1", room, c.socket.id as string, "c");
        b.send("room:join-request", { roomKey: room });
        await vi.waitFor(() => expect(a.requested).toHaveLength(1));

        a.send("room:join-answer", { roomKey: room, userId: "b", accept: true });
        c.send("room:join-answer", { roomKey: room, userId: "b", accept: false });
        await settle();
        expect(b.decisions).toEqual([{ roomKey: room, accepted: true }]);
        expect(a.cancelled).toHaveLength(1);
    });
});
