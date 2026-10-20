import { describe, expect, it } from "vitest";
import type { SeatArea } from "@/features/game/utils/buildSeatAreas";
import { findSeatDepth } from "@/features/game/utils/findSeatDepth";

const footprint = { x: 0, y: 0, width: 32, height: 32 };
const areas: SeatArea[] = [
    {
        footprint,
        seats: [
            { x: 16, y: 20, direction: "down", depth: 3 },
            { x: 48, y: 20, direction: "down", depth: 3 },
        ],
    },
    {
        footprint,
        seats: [{ x: 200, y: 100, direction: "left", depth: 5 }],
    },
];

describe("findSeatDepth", () => {
    it("takes the depth of the piece whose seat the peer is on", () => {
        expect(findSeatDepth(areas, { x: 200, y: 100 })).toBe(5);
    });

    it("absorbs the rounding of the network position", () => {
        expect(findSeatDepth(areas, { x: 17, y: 21 })).toBe(3);
    });

    it("returns null away from every seat", () => {
        expect(findSeatDepth(areas, { x: 90, y: 90 })).toBeNull();
    });
});
