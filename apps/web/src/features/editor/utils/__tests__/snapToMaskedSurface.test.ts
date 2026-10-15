import { describe, expect, it } from "vitest";
import { expandTileMask } from "@standin/contracts";
import {
    ASSET_PLACEMENTS,
    TILE_SIZE,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import { clampToSurface } from "@/features/editor/utils/planFreePosition";
import { snapToSurface } from "@/features/editor/utils/snapToSurface";

const asset = (overrides: Partial<AssetDefinition>): AssetDefinition =>
    ({
        id: "a",
        placement: ASSET_PLACEMENTS.GROUND,
        footprint: { w: 1, h: 1, offsetX: 0 },
        ...overrides,
    }) as AssetDefinition;

// The top row and the left column are occupied, the rest of the 3x3 is free.
const corner = asset({
    id: "corner",
    footprint: {
        w: 3,
        h: 3,
        offsetX: 0,
        mask: expandTileMask([
            [true, true, true],
            [true, false, false],
            [true, false, false],
        ]),
    },
});
const monitor = asset({ id: "monitor", placement: ASSET_PLACEMENTS.SURFACE });

// Anchored at (5, 5), so it spans x 5..7 and y 3..5.
const placedCorner: PlacedAsset = {
    id: "p1",
    assetId: "corner",
    tileX: 5,
    tileY: 5,
    offsetX: 0,
    offsetY: 0,
    parentId: null,
    propertyOverrides: null,
};

describe("snapToSurface with a footprint mask", () => {
    it("keeps a cell that is already on an occupied tile", () => {
        expect(snapToSurface([5, 4], monitor, placedCorner, corner)).toEqual([
            5, 4,
        ]);
    });

    it("moves a cell over the free part to the nearest occupied tile", () => {
        const [x, y] = snapToSurface([7, 5], monitor, placedCorner, corner);
        const occupied = (x === 5 && y >= 3) || y === 3;
        expect(occupied).toBe(true);
    });
});

describe("clampToSurface with a footprint mask", () => {
    it("moves an item over the free part to the grid of an occupied tile", () => {
        const left = 7 * TILE_SIZE;
        const bottom = 6 * TILE_SIZE;
        const result = clampToSurface(left, bottom, monitor, {
            placed: placedCorner,
            asset: corner,
        });
        const tileX = result.left / TILE_SIZE;
        const tileY = result.bottom / TILE_SIZE - 1;
        const occupied = (tileX === 5 && tileY >= 3) || tileY === 3;
        expect(occupied).toBe(true);
    });

    it("leaves a spot on an occupied tile where it is", () => {
        const left = 5 * TILE_SIZE + 4;
        const bottom = 5 * TILE_SIZE;
        expect(
            clampToSurface(left, bottom, monitor, {
                placed: placedCorner,
                asset: corner,
            })
        ).toEqual({ left, bottom });
    });
});
