import { describe, expect, it } from "vitest";
import {
    getCropFromCells,
    getFootprintFromCells,
    getFootprintRect,
    getFrameCrop,
    splitsIntoFrames,
    suggestFootprint,
    toFirstFrameCells,
} from "../spriteGeometry";

describe("getCropFromCells", () => {
    it("covers both cells, whichever way it is dragged", () => {
        const crop = { x: 32, y: 64, w: 128, h: 64 };
        expect(
            getCropFromCells({ col: 1, row: 2 }, { col: 4, row: 3 })
        ).toEqual(crop);
        expect(
            getCropFromCells({ col: 4, row: 3 }, { col: 1, row: 2 })
        ).toEqual(crop);
    });

    it("is one tile for a single cell", () => {
        expect(
            getCropFromCells({ col: 0, row: 0 }, { col: 0, row: 0 })
        ).toEqual({ x: 0, y: 0, w: 32, h: 32 });
    });
});

describe("suggestFootprint", () => {
    it("is as wide as the art and one tile deep", () => {
        expect(suggestFootprint({ x: 0, y: 0, w: 128, h: 64 })).toEqual({
            w: 4,
            h: 1,
            offsetX: 0,
        });
    });
});

describe("getFootprintFromCells", () => {
    const crop = { x: 64, y: 32, w: 64, h: 96 };

    it("reaches the bottom of the crop and is relative to its left", () => {
        expect(
            getFootprintFromCells(crop, { col: 3, row: 3 }, { col: 3, row: 3 })
        ).toEqual({ w: 1, h: 1, offsetX: 1 });
    });

    it("grows upward with the drag", () => {
        expect(
            getFootprintFromCells(crop, { col: 2, row: 2 }, { col: 3, row: 3 })
        ).toEqual({ w: 2, h: 2, offsetX: 0 });
    });

    it("stays inside the crop", () => {
        expect(
            getFootprintFromCells(crop, { col: 0, row: 0 }, { col: 9, row: 9 })
        ).toEqual({ w: 2, h: 3, offsetX: 0 });
    });
});

describe("getFootprintRect", () => {
    it("sits on the bottom rows of the crop, shifted by offsetX", () => {
        const crop = { x: 64, y: 32, w: 64, h: 96 };
        expect(getFootprintRect(crop, { w: 1, h: 1, offsetX: 1 })).toEqual({
            x: 96,
            y: 96,
            w: 32,
            h: 32,
        });
    });
});

describe("getFrameCrop", () => {
    const crop = { x: 0, y: 0, w: 128, h: 64 };

    it("is the crop for a static asset", () => {
        expect(getFrameCrop(crop, 1)).toEqual(crop);
    });

    it("is the first frame of a strip", () => {
        expect(getFrameCrop(crop, 4)).toEqual({ ...crop, w: 32 });
    });

    it("is the crop when a frame would be a fraction of a tile", () => {
        expect(getFrameCrop({ ...crop, w: 32 }, 2)).toEqual({ ...crop, w: 32 });
    });
});

describe("splitsIntoFrames", () => {
    it("needs frames of whole tiles", () => {
        const crop = { x: 0, y: 0, w: 128, h: 64 };
        expect(splitsIntoFrames(crop, 1)).toBe(true);
        expect(splitsIntoFrames(crop, 4)).toBe(true);
        expect(splitsIntoFrames(crop, 3)).toBe(false);
        expect(splitsIntoFrames({ ...crop, w: 32 }, 2)).toBe(false);
    });
});

describe("toFirstFrameCells", () => {
    const crop = { x: 32, y: 0, w: 192, h: 64 };
    const frame = { ...crop, w: 64 };

    it("moves a drag on a later frame into the first one", () => {
        expect(
            toFirstFrameCells(
                crop,
                frame,
                { col: 5, row: 1 },
                { col: 6, row: 1 }
            )
        ).toEqual([
            { col: 1, row: 1 },
            { col: 2, row: 1 },
        ]);
    });

    it("keeps the drag inside the frame where it started", () => {
        expect(
            toFirstFrameCells(
                crop,
                frame,
                { col: 3, row: 1 },
                { col: 7, row: 1 }
            )
        ).toEqual([
            { col: 1, row: 1 },
            { col: 2, row: 1 },
        ]);
    });
});
