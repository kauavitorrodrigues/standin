import { CreateAssetDataSchema, TILE_SIZE } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { buildFootprintMasks } from "../buildFootprintMasks";
import { detectCrop } from "../detectCrop";
import { detectFootprintMask, type PixelData } from "../detectSolidMask";

// A 160 x 128 image with an L of drawn pixels that covers only part of the
// tiles at its edges, like a desk whose art does not fill its tiles.
const IMAGE = { w: 160, h: 128 };
const drawn = (x: number, y: number) => {
    const topArm = x >= 36 && x < 124 && y >= 20 && y < 52;
    const leftArm = x >= 36 && x < 84 && y >= 20 && y < 100;
    return topArm || leftArm;
};
const lShape = (): PixelData => {
    const data = new Uint8ClampedArray(IMAGE.w * IMAGE.h * 4);
    for (let y = 0; y < IMAGE.h; y += 1) {
        for (let x = 0; x < IMAGE.w; x += 1) {
            if (drawn(x, y)) data[(y * IMAGE.w + x) * 4 + 3] = 255;
        }
    }
    return { width: IMAGE.w, height: IMAGE.h, data };
};

describe("the marks an image brings in on its own", () => {
    const pixels = lShape();
    const crop = detectCrop(pixels)!;
    const footprint = {
        w: crop.w / TILE_SIZE,
        h: crop.h / TILE_SIZE,
        offsetX: 0,
    };

    it("crops the drawing to whole tiles and takes the footprint from it", () => {
        expect(crop).toEqual({ x: 32, y: 0, w: 96, h: 128 });
        expect(footprint).toEqual({ w: 3, h: 4, offsetX: 0 });
    });

    it("reads the cells of the drawing and leaves the transparent ones free", () => {
        const cells = detectFootprintMask(pixels, crop, footprint)!;
        // The corner inside the L has no drawing at all.
        expect(cells[8]?.[8]).toBe(false);
        // The left arm and the top arm are drawn.
        expect(cells[8]?.[1]).toBe(true);
        expect(cells[2]?.[8]).toBe(true);
    });

    it("sends a payload the server accepts, with the footprint as thin as the drawing", () => {
        const cells = detectFootprintMask(pixels, crop, footprint)!;
        const masks = buildFootprintMasks({
            ...footprint,
            mask: cells,
            solidMask: null,
            solid: true,
            isAnimated: false,
        });
        // The collision follows the footprint, so only the footprint goes up.
        expect(masks.mask).toEqual(cells);
        expect(masks).not.toHaveProperty("solidMask");

        const parsed = CreateAssetDataSchema.safeParse({
            name: "Mesa em L",
            type: "DESK",
            footprint: { ...footprint, ...masks },
        });
        expect(parsed.success).toBe(true);
    });
});
