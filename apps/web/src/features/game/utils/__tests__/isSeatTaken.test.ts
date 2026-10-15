import { describe, expect, it } from "vitest";
import { isSeatTaken } from "@/features/game/utils/isSeatTaken";

describe("isSeatTaken", () => {
    const seat = { x: 100, y: 100 };

    it("is taken by an avatar on the seat, give or take rounding", () => {
        expect(isSeatTaken(seat, [{ x: 100, y: 100 }])).toBe(true);
        expect(isSeatTaken(seat, [{ x: 102, y: 99 }])).toBe(true);
    });

    it("is free when the avatars are elsewhere or there are none", () => {
        expect(isSeatTaken(seat, [{ x: 132, y: 100 }])).toBe(false);
        expect(isSeatTaken(seat, [])).toBe(false);
    });
});
