import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import { resolveDefaultSpawnPoint } from "../map";

describe("resolveDefaultSpawnPoint", () => {
    it("puts the anchor on the center of the cell at the middle of the map", () => {
        const spawn = resolveDefaultSpawnPoint({
            widthInPixels: TILE_SIZE * 10,
            heightInPixels: TILE_SIZE * 7,
        });

        expect(spawn).toEqual({
            x: TILE_SIZE * 5.5,
            y: TILE_SIZE * 3.5,
        });
    });

    it("stays inside the map on the smallest one", () => {
        const spawn = resolveDefaultSpawnPoint({
            widthInPixels: TILE_SIZE,
            heightInPixels: TILE_SIZE,
        });

        expect(spawn).toEqual({ x: TILE_SIZE / 2, y: TILE_SIZE / 2 });
    });
});
