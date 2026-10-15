import { describe, expect, it } from "vitest";
import type { MapLock } from "../types/MapLock";
import { toLockState } from "../utils/toLockState";

describe("toLockState", () => {
    it("is unlocked without a lock", () => {
        expect(toLockState(undefined)).toEqual({ locked: false });
    });

    it("exposes the holder and the start, never the session", () => {
        const lock: MapLock = {
            mapId: "m1",
            userId: "u1",
            userName: "Ana",
            sessionId: "s1",
            mode: "objects",
            acquiredAt: Date.UTC(2026, 0, 2, 3, 4, 5),
            lastHeartbeatAt: Date.UTC(2026, 0, 2, 3, 4, 20),
        };

        expect(toLockState(lock)).toEqual({
            locked: true,
            by: { id: "u1", name: "Ana" },
            since: "2026-01-02T03:04:05.000Z",
            mode: "objects",
        });
    });
});
