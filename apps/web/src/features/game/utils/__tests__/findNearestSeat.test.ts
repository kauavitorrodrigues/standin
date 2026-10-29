import { describe, expect, it } from "vitest";
import { PLAYER_DIRECTIONS } from "@standin/contracts";
import { findNearestSeat } from "@/features/game/utils/findNearestSeat";
import type { SeatSpot } from "@/features/game/utils/buildSeatAreas";

const spot = (x: number, y: number): SeatSpot => ({
    x,
    y,
    direction: PLAYER_DIRECTIONS.DOWN,
    depth: 0,
});

describe("findNearestSeat", () => {
    it("returns null when there is no seat", () => {
        expect(findNearestSeat([], { x: 0, y: 0 })).toBeNull();
    });

    it("measures in steps along the axes, not in a straight line", () => {
        // From the origin: the diagonal one is 14.1 px away in a straight line
        // but 20 along the axes, the straight one is 16 either way.
        const diagonal = spot(10, 10);
        const straight = spot(16, 0);

        expect(findNearestSeat([diagonal, straight], { x: 0, y: 0 })).toBe(straight);
    });

    it("keeps the first seat of the list on a tie", () => {
        const first = spot(10, 0);
        const second = spot(0, 10);

        expect(findNearestSeat([first, second], { x: 0, y: 0 })).toBe(first);
        expect(findNearestSeat([second, first], { x: 0, y: 0 })).toBe(second);
    });
});
