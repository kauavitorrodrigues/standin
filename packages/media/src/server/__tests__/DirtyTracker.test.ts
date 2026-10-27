import { describe, expect, it } from "vitest";
import { createDirtyTracker } from "../DirtyTracker";

const index = (spots: Record<string, { x: number; y: number }>) => ({
    get: (id: string) => spots[id],
    query: (x: number, y: number, radius: number) =>
        Object.keys(spots).filter((id) => {
            const spot = spots[id]!;
            return Math.hypot(spot.x - x, spot.y - y) <= radius;
        }),
});

describe("createDirtyTracker", () => {
    const spots = {
        a: { x: 0, y: 0 },
        b: { x: 100, y: 0 },
        c: { x: 900, y: 0 },
    };

    it("expands a mover to the people around the new spot", () => {
        const tracker = createDirtyTracker();
        tracker.markMoved("s", "a");
        const dirty = tracker.take("s", index(spots), new Map(), 150);
        expect([...dirty].sort()).toEqual(["a", "b"]);
    });

    it("adds the people who consume the mover", () => {
        const tracker = createDirtyTracker();
        tracker.markMoved("s", "a");
        const current = new Map([
            [
                "c",
                [
                    {
                        personId: "a",
                        producerId: "p",
                        kind: "audio" as const,
                        layer: null,
                        paused: false,
                    },
                ],
            ],
        ]);
        const dirty = tracker.take("s", index(spots), current, 150);
        expect(dirty.has("c")).toBe(true);
    });

    it("keeps plain receivers as they are and empties after a take", () => {
        const tracker = createDirtyTracker();
        tracker.markReceivers("s", ["c"]);
        expect(tracker.hasPending("s")).toBe(true);
        expect([...tracker.take("s", index(spots), new Map(), 150)]).toEqual([
            "c",
        ]);
        expect(tracker.hasPending("s")).toBe(false);
    });

    it("keeps spaces apart", () => {
        const tracker = createDirtyTracker();
        tracker.markReceivers("one", ["a"]);
        expect(tracker.hasPending("two")).toBe(false);
        tracker.forget("one");
        expect(tracker.hasPending("one")).toBe(false);
    });
});
