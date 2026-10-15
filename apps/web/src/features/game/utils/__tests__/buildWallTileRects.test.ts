import { describe, expect, it } from "vitest";
import type { WallTileMeta } from "@/features/game/types/wall-tile";
import { buildWallTileRects } from "@/features/game/utils/buildWallTileRects";
import { PLAIN_WALL_TILE } from "@/features/game/utils/wallTile";

const east: boolean[][] = Array.from({ length: 4 }, () => [
    false,
    false,
    false,
    true,
]);

const meta = (patch: Partial<WallTileMeta>): WallTileMeta => ({
    ...PLAIN_WALL_TILE,
    ...patch,
});

describe("buildWallTileRects", () => {
    it("blocks one rectangle of 8 x 32 for a trace on the east edge", () => {
        expect(buildWallTileRects(meta({ solidMask: east }), 2, 3)).toEqual([
            { x: 2 * 32 + 24, y: 3 * 32, width: 8, height: 32 },
        ]);
    });

    it("blocks the whole tile for a solid tile with no mask", () => {
        expect(buildWallTileRects(meta({ solid: true }), 1, 1)).toEqual([
            { x: 32, y: 32, width: 32, height: 32 },
        ]);
    });

    it("blocks nothing for a tile that is neither solid nor masked", () => {
        expect(buildWallTileRects(PLAIN_WALL_TILE, 0, 0)).toEqual([]);
    });

    it("blocks the cells of a mask in L as two rectangles", () => {
        const l = [
            [true, false, false, false],
            [true, false, false, false],
            [true, false, false, false],
            [true, true, true, true],
        ];
        const rects = buildWallTileRects(meta({ solidMask: l }), 0, 0);
        expect(rects).toHaveLength(2);
        expect(rects).toContainEqual({ x: 0, y: 0, width: 8, height: 24 });
        expect(rects).toContainEqual({ x: 0, y: 24, width: 32, height: 8 });
    });

    it("lets the mask win over the solid flag", () => {
        const rects = buildWallTileRects(
            meta({ solid: true, solidMask: east }),
            0,
            0
        );
        expect(rects).toEqual([{ x: 24, y: 0, width: 8, height: 32 }]);
    });
});
