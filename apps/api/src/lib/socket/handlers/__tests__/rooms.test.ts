import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerRoomCrossed } from "../roomCrossed";
import { registerRoomOpen } from "../roomOpen";
import { registerRoomPresent } from "../roomPresent";
import { registerRoomLock } from "../roomLock";
import { registerRoomUnlock } from "../roomUnlock";
import { registerDisconnect } from "../disconnect";
import { RoomStates } from "../../utils/roomStates";

const roomEmit = vi.fn();
const io = { to: vi.fn(() => ({ emit: roomEmit })) } as any;

function createSocket(id: string, spaceId: string | null = "s1") {
    const handlers = new Map<string, (p: unknown) => void>();
    const peerEmit = vi.fn();
    const socket = {
        id,
        data: { userId: id, spaceId },
        emit: vi.fn(),
        to: vi.fn(() => ({ emit: peerEmit })),
        on: vi.fn((event: string, fn: (p: unknown) => void) => {
            handlers.set(event, fn);
        }),
    };
    registerRoomCrossed(io, socket as any);
    registerRoomOpen(io, socket as any);
    registerRoomPresent(io, socket as any);
    registerRoomLock(io, socket as any);
    registerRoomUnlock(io, socket as any);
    registerDisconnect(socket as any);
    return {
        socket,
        peerEmit,
        send: (event: string, payload: unknown) => handlers.get(event)?.(payload),
    };
}

const roomKey = "media";

describe("room handlers", () => {
    beforeEach(() => {
        RoomStates.clear();
        roomEmit.mockClear();
        io.to.mockClear();
    });

    it("closes on entering and opens on leaving", () => {
        const a = createSocket("a");
        a.send("room:crossed", { roomKey, direction: "in" });
        expect(io.to).toHaveBeenCalledWith("space:s1");
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "closed" });
        a.send("room:crossed", { roomKey, direction: "out" });
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "open" });
    });

    it("opens a closed door by stepping on it and ignores it otherwise", () => {
        const a = createSocket("a");
        a.send("room:crossed", { roomKey, direction: "in" });
        a.send("room:open", { roomKey });
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "open" });
        a.send("room:open", { roomKey });
        expect(a.socket.emit).toHaveBeenCalledWith("room:state", { roomKey, state: "open" });
    });

    it("lets only who is inside lock and unlock", () => {
        const a = createSocket("a");
        const b = createSocket("b");
        a.send("room:crossed", { roomKey, direction: "in" });
        b.send("room:lock", { roomKey });
        expect(b.socket.emit).toHaveBeenCalledWith("room:state", { roomKey, state: "closed" });
        a.send("room:lock", { roomKey });
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "locked" });
        b.send("room:unlock", { roomKey });
        expect(b.socket.emit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "locked" });
        a.send("room:unlock", { roomKey });
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "closed" });
    });

    it("refuses to enter a locked room and opens it when the locker leaves", () => {
        const a = createSocket("a");
        const b = createSocket("b");
        a.send("room:crossed", { roomKey, direction: "in" });
        a.send("room:lock", { roomKey });
        b.send("room:crossed", { roomKey, direction: "in" });
        expect(b.socket.emit).toHaveBeenCalledWith("room:state", { roomKey, state: "locked" });
        a.send("room:crossed", { roomKey, direction: "out" });
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "open" });
    });

    it("ignores a socket that has not joined a space", () => {
        const a = createSocket("a", null);
        a.send("room:crossed", { roomKey, direction: "in" });
        expect(roomEmit).not.toHaveBeenCalled();
        expect(a.socket.emit).not.toHaveBeenCalled();
    });

    it("ignores an invalid payload", () => {
        const a = createSocket("a");
        a.send("room:crossed", { roomKey, direction: "sideways" });
        expect(roomEmit).not.toHaveBeenCalled();
    });

    it("opens a locked room when the last one inside disconnects", () => {
        const a = createSocket("a");
        a.send("room:crossed", { roomKey, direction: "in" });
        a.send("room:lock", { roomKey });
        expect(RoomStates.listNotOpen("s1")).toEqual([{ roomKey, state: "locked" }]);
        a.send("disconnect", undefined);
        expect(a.peerEmit).toHaveBeenCalledWith("room:state", { roomKey, state: "open" });
        expect(RoomStates.listNotOpen("s1")).toEqual([]);
    });

    it("room:present adds the socket without changing the state", () => {
        const a = createSocket("a");
        a.send("room:crossed", { roomKey, direction: "in" });
        a.send("room:lock", { roomKey });
        roomEmit.mockClear();

        const b = createSocket("b");
        b.send("room:present", { roomKey });
        expect(roomEmit).not.toHaveBeenCalled();
        expect(b.socket.emit).toHaveBeenCalledWith("room:state", { roomKey, state: "locked" });

        b.send("room:unlock", { roomKey });
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "closed" });
    });

    it("room:present is ignored outside a space and with a bad payload", () => {
        const a = createSocket("a", null);
        a.send("room:present", { roomKey });
        const b = createSocket("b");
        b.send("room:present", {});
        expect(a.socket.emit).not.toHaveBeenCalled();
        expect(b.socket.emit).not.toHaveBeenCalled();
    });

    it("the last present socket leaving a locked room opens it", () => {
        const a = createSocket("a");
        a.send("room:present", { roomKey });
        a.send("room:lock", { roomKey });
        a.send("room:crossed", { roomKey, direction: "out" });
        expect(roomEmit).toHaveBeenLastCalledWith("room:state", { roomKey, state: "open" });
    });
});
