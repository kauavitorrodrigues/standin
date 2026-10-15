import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { findOwnerMock, emitToSocketMock, emitToRoomMock } = vi.hoisted(() => ({
    findOwnerMock: vi.fn(),
    emitToSocketMock: vi.fn(),
    emitToRoomMock: vi.fn(),
}));

vi.mock("@standin/core", async () => {
    const actual = await vi.importActual<typeof import("@standin/core")>(
        "@standin/core"
    );
    return {
        ...actual,
        MapService: { findOwner: findOwnerMock },
    };
});

vi.mock("@/lib/socket/socketManager", () => ({
    SocketManager: {
        emitToSocket: emitToSocketMock,
        emitToRoom: emitToRoomMock,
    },
}));

vi.mock("../socketManager", () => ({
    SocketManager: {
        emitToSocket: emitToSocketMock,
        emitToRoom: emitToRoomMock,
    },
}));

import { LOCK_TTL_MS } from "@standin/contracts";
import { MapLockService } from "@standin/core";
import { startLockSweeper } from "../startLockSweeper";
import { EditorSessions } from "../utils/editorSessions";

const INTERVAL = 5000;
const spaceOwner = {
    kind: "space",
    spaceId: "space-1",
    organizationId: "org-1",
};

type FakeLock = ReturnType<typeof MapLockService.sweepExpired>[number];

// The real service captures Date.now at creation, so the simulated clock is
// applied here: a lock is removed once the faked time passes its TTL.
let locks: FakeLock[] = [];

function addLock(mapId: string, sessionId: string, heartbeatAt = Date.now()) {
    locks.push({
        mapId,
        userId: "user-1",
        userName: "Ana",
        sessionId,
        mode: "map",
        acquiredAt: heartbeatAt,
        lastHeartbeatAt: heartbeatAt,
    });
}

function sweepWithSimulatedClock(): FakeLock[] {
    const expired = locks.filter(
        (lock) => Date.now() - lock.lastHeartbeatAt > LOCK_TTL_MS
    );
    locks = locks.filter((lock) => !expired.includes(lock));
    return expired;
}

describe("startLockSweeper", () => {
    let stop: () => void;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
        vi.spyOn(console, "error").mockImplementation(() => {});
        findOwnerMock.mockReset().mockResolvedValue(spaceOwner);
        emitToSocketMock.mockReset();
        emitToRoomMock.mockReset();
        EditorSessions.clear();
        locks = [];
        vi.spyOn(MapLockService, "sweepExpired").mockImplementation(
            sweepWithSimulatedClock
        );
        stop = startLockSweeper(INTERVAL);
    });

    afterEach(() => {
        stop();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("emits map_unlocked and lock_lost once for an expired lock", async () => {
        addLock("map-1", "session-1");
        EditorSessions.set("session-1", "socket-1");

        await vi.advanceTimersByTimeAsync(LOCK_TTL_MS + INTERVAL);

        expect(emitToSocketMock).toHaveBeenCalledTimes(1);
        expect(emitToSocketMock).toHaveBeenCalledWith(
            "socket-1",
            "editor:lock_lost",
            { mapId: "map-1", reason: "EXPIRED" }
        );
        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-1",
            "map_unlocked",
            { mapId: "map-1", mode: "map" }
        );
        expect(EditorSessions.get("session-1")).toBeUndefined();

        await vi.advanceTimersByTimeAsync(INTERVAL * 3);
        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("does nothing for a live lock", async () => {
        addLock("map-1", "session-1");
        EditorSessions.set("session-1", "socket-1");

        await vi.advanceTimersByTimeAsync(INTERVAL * 3);

        expect(emitToSocketMock).not.toHaveBeenCalled();
        expect(emitToRoomMock).not.toHaveBeenCalled();
    });

    it("still unlocks the room when the old session is disconnected", async () => {
        addLock("map-1", "session-1");

        await vi.advanceTimersByTimeAsync(LOCK_TTL_MS + INTERVAL);

        expect(emitToSocketMock).not.toHaveBeenCalled();
        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
    });

    it("keeps going when one map fails", async () => {
        addLock("map-1", "session-1");
        addLock("map-2", "session-2");
        findOwnerMock
            .mockRejectedValueOnce(new Error("boom"))
            .mockResolvedValueOnce({ ...spaceOwner, spaceId: "space-2" });

        await vi.advanceTimersByTimeAsync(LOCK_TTL_MS + INTERVAL);

        expect(console.error).toHaveBeenCalledTimes(1);
        expect(emitToRoomMock).toHaveBeenCalledTimes(1);
        expect(emitToRoomMock).toHaveBeenCalledWith(
            "space:space-2",
            "map_unlocked",
            { mapId: "map-2", mode: "map" }
        );
    });

    it("stop() halts the sweep", async () => {
        addLock("map-1", "session-1");
        stop();

        await vi.advanceTimersByTimeAsync(LOCK_TTL_MS + INTERVAL * 2);

        expect(emitToRoomMock).not.toHaveBeenCalled();
        expect(locks).toHaveLength(1);
    });
});
