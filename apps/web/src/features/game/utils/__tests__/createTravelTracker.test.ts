import { describe, expect, it } from "vitest";
import { createTravelTracker } from "../createTravelTracker";

const make = () => createTravelTracker({ minDistance: 100, maxStep: 40 });

describe("createTravelTracker", () => {
    it("does not count the first position", () => {
        const tracker = make();
        expect(tracker.update(500, 500)).toBe(false);
    });

    it("fires once the distance walked reaches the minimum", () => {
        const tracker = make();
        tracker.update(0, 0);
        expect(tracker.update(30, 0)).toBe(false);
        expect(tracker.update(60, 0)).toBe(false);
        expect(tracker.update(90, 0)).toBe(false);
        expect(tracker.update(120, 0)).toBe(true);
    });

    it("fires only once", () => {
        const tracker = make();
        tracker.update(0, 0);
        [30, 60, 90, 120].forEach((x) => tracker.update(x, 0));
        expect(tracker.update(150, 0)).toBe(false);
    });

    it("skips a jump larger than the step limit", () => {
        const tracker = make();
        tracker.update(0, 0);
        expect(tracker.update(300, 300)).toBe(false);
        expect(tracker.update(330, 300)).toBe(false);
        expect(tracker.update(360, 300)).toBe(false);
        expect(tracker.update(390, 300)).toBe(false);
    });

    it("does not count standing still", () => {
        const tracker = make();
        tracker.update(10, 10);
        for (let i = 0; i < 1000; i++) {
            expect(tracker.update(10, 10)).toBe(false);
        }
    });
});
