import { describe, expect, it } from "vitest";
import { getRoomAt } from "@/features/game/utils/getRoomAt";
import type { GameRoom } from "@/features/game/types/room";

const rect: GameRoom = {
    key: "r",
    label: "R",
    x: 100,
    y: 100,
    width: 64,
    height: 64,
};
const triangle: GameRoom = {
    key: "t",
    label: "T",
    x: 300,
    y: 300,
    width: 0,
    height: 0,
    polygon: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
    ],
};

describe("getRoomAt", () => {
    it("finds the rectangle room that holds the point", () => {
        expect(getRoomAt([rect], { x: 120, y: 120 })?.key).toBe("r");
        expect(getRoomAt([rect], { x: 100, y: 100 })?.key).toBe("r");
    });

    it("returns null outside every room", () => {
        expect(getRoomAt([rect], { x: 164, y: 120 })).toBeNull();
        expect(getRoomAt([], { x: 0, y: 0 })).toBeNull();
    });

    it("follows the polygon, not its bounding box", () => {
        expect(getRoomAt([triangle], { x: 320, y: 320 })?.key).toBe("t");
        expect(getRoomAt([triangle], { x: 390, y: 390 })).toBeNull();
    });
});
