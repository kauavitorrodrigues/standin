import { expandTileMask } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { buildPlacedSlices } from "../buildPlacedSlices";

const MAP_HEIGHT = 640;

// A 2 x 2 footprint on a sprite of the same size.
const asset = (mask: boolean[][] | null) => ({
    sprite: { w: 64, h: 64 },
    footprint: { w: 2, h: 2, offsetX: 0, mask },
});

describe("buildPlacedSlices", () => {
    it("keeps an object without a mask as one slice", () => {
        expect(buildPlacedSlices(asset(null), 320, MAP_HEIGHT)).toHaveLength(1);
    });

    it("cuts an object with a whole free tile, one slice per row", () => {
        const corner = expandTileMask([
            [true, true],
            [true, false],
        ]);
        expect(buildPlacedSlices(asset(corner), 320, MAP_HEIGHT)).toHaveLength(
            2
        );
    });

    it("keeps one slice when the mask only frees part of the tiles", () => {
        // The right half of every cell row is free, so no tile is whole free.
        const thin = Array.from({ length: 8 }, () =>
            Array.from({ length: 8 }, (_, col) => col % 4 < 2)
        );
        expect(buildPlacedSlices(asset(thin), 320, MAP_HEIGHT)).toHaveLength(1);
    });
});
