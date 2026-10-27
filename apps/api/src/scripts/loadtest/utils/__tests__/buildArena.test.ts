import { describe, expect, it } from "vitest";
import { buildMapArena, buildSquareArena } from "../buildArena";

// 4 by 3 tiles of 32 px. The walls layer has one wall at column 1, row 1.
const layout = {
    width: 4,
    height: 3,
    layers: [
        {
            name: "walls",
            type: "tilelayer",
            width: 4,
            height: 3,
            data: [0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0],
        },
    ],
};

const map = { width: 4, height: 3, tileSize: 32, layout: layout as never };

describe("buildMapArena", () => {
    it("takes its size from the map", () => {
        const arena = buildMapArena(map);

        expect(arena.widthPx).toBe(128);
        expect(arena.heightPx).toBe(96);
    });

    it("is free on the floor and not on a wall or outside the map", () => {
        const arena = buildMapArena(map);

        expect(arena.isFree(10, 10)).toBe(true);
        expect(arena.isFree(40, 40)).toBe(false);
        expect(arena.isFree(-1, 10)).toBe(false);
        expect(arena.isFree(128, 10)).toBe(false);
        expect(arena.isFree(10, 96)).toBe(false);
    });

    it("only hands out points on the floor", () => {
        const arena = buildMapArena(map);
        let seed = 7;
        const rng = () => {
            seed = (seed * 16807) % 2147483647;
            return seed / 2147483647;
        };

        for (let i = 0; i < 300; i += 1) {
            const point = arena.randomFreePoint(rng);
            expect(arena.isFree(point.x, point.y)).toBe(true);
        }
    });

    it("falls back to the first free cell when random points keep hitting walls", () => {
        const arena = buildMapArena(map);

        // A generator that always points at the wall cell.
        const point = arena.randomFreePoint(() => 0.4);

        expect(arena.isFree(point.x, point.y)).toBe(true);
    });

    it("throws when the map is all walls", () => {
        const solid = {
            ...map,
            layout: {
                ...layout,
                layers: [{ ...layout.layers[0], data: Array(12).fill(1) }],
            } as never,
        };

        expect(() => buildMapArena(solid).randomFreePoint(() => 0.5)).toThrow(
            /no free cell/
        );
    });
});

describe("buildSquareArena", () => {
    it("is a square with no walls", () => {
        const arena = buildSquareArena(100);

        expect(arena.isFree(50, 50)).toBe(true);
        expect(arena.isFree(101, 50)).toBe(false);
    });
});
