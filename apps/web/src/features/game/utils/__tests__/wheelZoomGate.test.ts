import { describe, expect, it, vi } from "vitest";

// Phaser draws to a canvas when it loads, which the gate has no use for.
vi.mock("phaser", () => ({ default: {} }));

import { createWheelZoomGate } from "@/features/game/utils/zoom";

describe("createWheelZoomGate", () => {
    it("lets the first event through and drops the ones in the cooldown", () => {
        let time = 1000;
        const mayStep = createWheelZoomGate(260, () => time);

        expect(mayStep()).toBe(true);
        time += 100;
        expect(mayStep()).toBe(false);
        time += 100;
        expect(mayStep()).toBe(false);
    });

    it("lets a new event through once the cooldown is over", () => {
        let time = 1000;
        const mayStep = createWheelZoomGate(260, () => time);

        mayStep();
        time += 260;

        expect(mayStep()).toBe(true);
    });
});
