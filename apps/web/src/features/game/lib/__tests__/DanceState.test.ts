import { describe, expect, it } from "vitest";
import { DANCE_MAX_MS } from "@standin/contracts";
import { DanceState } from "../DanceState";

const SPOT = { x: 10, y: 20 };

describe("DanceState", () => {
    it("starts on an avatar that can dance and stops on release", () => {
        const dance = new DanceState();

        expect(dance.start(0, true, SPOT)).toBe(true);
        expect(dance.isActive).toBe(true);

        dance.stop();
        expect(dance.isActive).toBe(false);
    });

    it("does not start when the avatar cannot dance", () => {
        const dance = new DanceState();

        expect(dance.start(0, false, SPOT)).toBe(false);
        expect(dance.isActive).toBe(false);
    });

    it("ends when the avatar can no longer dance", () => {
        const dance = new DanceState();
        dance.start(0, true, SPOT);

        expect(dance.update(100, true, SPOT)).toBe(true);
        expect(dance.update(200, false, SPOT)).toBe(false);
        expect(dance.isActive).toBe(false);
    });

    it("ends at the cap, and does not come back on its own", () => {
        const dance = new DanceState();
        dance.start(1000, true, SPOT);

        expect(dance.update(1000 + DANCE_MAX_MS - 1, true, SPOT)).toBe(true);
        expect(dance.update(1000 + DANCE_MAX_MS, true, SPOT)).toBe(false);
        expect(dance.update(1000 + DANCE_MAX_MS + 1, true, SPOT)).toBe(false);
    });

    it("keeps the first start when started again while on", () => {
        const dance = new DanceState();
        dance.start(0, true, SPOT);
        dance.start(DANCE_MAX_MS - 1, true, SPOT);

        expect(dance.update(DANCE_MAX_MS, true, SPOT)).toBe(false);
    });

    it("ends when the avatar is somewhere else, as after a teleport", () => {
        const dance = new DanceState();
        dance.start(0, true, SPOT);

        expect(dance.update(10, true, { x: 10.2, y: 19.8 })).toBe(true);
        expect(dance.update(20, true, { x: 300, y: 20 })).toBe(false);
        expect(dance.isActive).toBe(false);
    });
});
