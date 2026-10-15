import { describe, expect, it } from "vitest";
import { buildAssetData } from "../buildData";
import { describeFootprint } from "../describeFootprint";
import {
    buildMaskField,
    countFootprintCells,
    countOccupiedCells,
    fillMask,
    normalizeMask,
    resolveMask,
    toPayloadMask,
} from "../footprintMask";
import { validateCreateAsset } from "../validateCreate";
import { createValues } from "./fixtures";

const footprint = { w: 2, h: 1, offsetX: 0 };

// A mask of the footprint with only the cells where `occupied` is true.
const cellsOf = (occupied: (col: number, row: number) => boolean) =>
    Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => occupied(col, row))
    );
const leftHalf = cellsOf((col) => col < 4);

describe("mask reading", () => {
    it("counts the cells of a footprint without a mask", () => {
        expect(countFootprintCells(footprint)).toBe(32);
        expect(countOccupiedCells(footprint, null)).toBe(32);
    });

    it("counts the occupied cells of a mask", () => {
        expect(countOccupiedCells(footprint, leftHalf)).toBe(16);
    });

    it("fills every cell when there is no mask", () => {
        const cells = fillMask(footprint);
        expect(cells).toHaveLength(4);
        expect(
            cells.every((row) => row.length === 8 && row.every(Boolean))
        ).toBe(true);
        expect(resolveMask(footprint, null)).toEqual(cells);
        expect(resolveMask(footprint, leftHalf)).toBe(leftHalf);
    });
});

describe("payload", () => {
    it("goes back to null when every cell is occupied", () => {
        expect(normalizeMask(fillMask(footprint))).toBeNull();
        expect(normalizeMask(leftHalf)).toBe(leftHalf);
    });

    it("sends no mask for an animated asset", () => {
        expect(toPayloadMask(leftHalf, true)).toBeNull();
        expect(toPayloadMask(leftHalf, false)).toBe(leftHalf);
    });

    it("adds the mask key only when there is one", () => {
        expect(buildMaskField(null)).toEqual({});
        expect(buildMaskField(leftHalf)).toEqual({ mask: leftHalf });
    });

    it("sends the mask in the footprint of the asset", () => {
        const data = buildAssetData(
            createValues({
                footprintW: 2,
                footprintH: 1,
                footprintMask: leftHalf,
            })
        );
        expect(data.footprint).toEqual({
            w: 2,
            h: 1,
            offsetX: 0,
            mask: leftHalf,
        });
    });

    it("sends no mask for an animated asset form", () => {
        const data = buildAssetData(
            createValues({
                footprintW: 2,
                footprintH: 1,
                footprintMask: leftHalf,
                isAnimated: true,
            })
        );
        expect(data.footprint).toEqual({ w: 2, h: 1, offsetX: 0 });
    });
});

describe("validation", () => {
    it("refuses a mask that does not fit the footprint", () => {
        const errors = validateCreateAsset(
            createValues({
                footprintW: 2,
                footprintH: 1,
                footprintMask: [[true, false]],
            }),
            undefined
        );
        expect(errors.footprintMask).toBeDefined();
    });

    it("accepts a mask that fits", () => {
        const errors = validateCreateAsset(
            createValues({
                footprintW: 2,
                footprintH: 1,
                footprintMask: leftHalf,
            }),
            undefined
        );
        expect(errors.footprintMask).toBeUndefined();
    });
});

describe("describeFootprint", () => {
    it("keeps the plain text without a mask", () => {
        expect(describeFootprint(footprint, null)).toBe(
            "2 × 1 tiles, deslocamento 0"
        );
    });

    it("counts the occupied cells with a mask", () => {
        expect(describeFootprint(footprint, leftHalf)).toBe(
            "2 × 1 tiles, 16 células ocupadas, deslocamento 0"
        );
    });
});
