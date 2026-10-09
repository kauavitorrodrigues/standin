import { describe, expect, it } from "vitest";
import type Phaser from "phaser";
import { applyFpsLimit } from "../fpsLimit";

const createGame = () => {
    const loop = { fpsLimit: 0, hasFpsLimit: false, _limitRate: 0 };
    return { game: { loop } as unknown as Phaser.Game, loop };
};

describe("applyFpsLimit", () => {
    it("limits the loop and keeps its rate in milliseconds in step", () => {
        const { game, loop } = createGame();

        applyFpsLimit(game, 30);

        expect(loop.fpsLimit).toBe(30);
        expect(loop.hasFpsLimit).toBe(true);
        expect(loop._limitRate).toBeCloseTo(1000 / 30);
    });

    it("removes the limit with zero", () => {
        const { game, loop } = createGame();
        applyFpsLimit(game, 60);

        applyFpsLimit(game, 0);

        expect(loop.hasFpsLimit).toBe(false);
        expect(loop._limitRate).toBe(0);
    });
});
