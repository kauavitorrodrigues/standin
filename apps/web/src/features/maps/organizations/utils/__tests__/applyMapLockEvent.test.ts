import { describe, expect, it } from "vitest";
import type { MapLockState } from "@standin/contracts";
import { applyMapLockEvent } from "../applyMapLockEvent";

const FREE: MapLockState = { locked: false };
const LOCKED: MapLockState = {
    locked: true,
    by: { id: "u1", name: "Ana" },
    since: "2026-01-01T10:00:00.000Z",
};

describe("applyMapLockEvent", () => {
    it("keeps the map free when nothing happens", () => {
        expect(
            applyMapLockEvent(
                FREE,
                { type: "unlocked", payload: { mapId: "m1" } },
                "m1"
            )
        ).toEqual(FREE);
    });

    it("locks the map with who and since", () => {
        expect(
            applyMapLockEvent(
                FREE,
                {
                    type: "locked",
                    payload: {
                        mapId: "m1",
                        by: { id: "u1", name: "Ana" },
                        since: LOCKED.since!,
                    },
                },
                "m1"
            )
        ).toEqual(LOCKED);
    });

    it("frees a locked map on unlock", () => {
        expect(
            applyMapLockEvent(
                LOCKED,
                { type: "unlocked", payload: { mapId: "m1" } },
                "m1"
            )
        ).toEqual(FREE);
    });

    it("ignores events of another map", () => {
        expect(
            applyMapLockEvent(
                FREE,
                {
                    type: "locked",
                    payload: {
                        mapId: "m2",
                        by: { id: "u2", name: "Bia" },
                        since: LOCKED.since!,
                    },
                },
                "m1"
            )
        ).toEqual(FREE);
        expect(
            applyMapLockEvent(
                LOCKED,
                { type: "unlocked", payload: { mapId: "m2" } },
                "m1"
            )
        ).toEqual(LOCKED);
    });

    it("keeps the mode of the lock", () => {
        expect(
            applyMapLockEvent(
                FREE,
                {
                    type: "locked",
                    payload: {
                        mapId: "m1",
                        by: { id: "u1", name: "Ana" },
                        since: LOCKED.since!,
                        mode: "objects",
                    },
                },
                "m1"
            )
        ).toEqual({ ...LOCKED, mode: "objects" });
    });

    it("frees only the mode that the unlock names", () => {
        const studio = { ...LOCKED, mode: "map" } as const;
        const decorator = { ...LOCKED, mode: "objects" } as const;

        expect(
            applyMapLockEvent(
                studio,
                { type: "unlocked", payload: { mapId: "m1", mode: "objects" } },
                "m1"
            )
        ).toEqual(studio);
        expect(
            applyMapLockEvent(
                decorator,
                { type: "unlocked", payload: { mapId: "m1", mode: "objects" } },
                "m1"
            )
        ).toEqual(FREE);
        expect(
            applyMapLockEvent(
                decorator,
                { type: "unlocked", payload: { mapId: "m1" } },
                "m1"
            )
        ).toEqual(FREE);
    });
});
