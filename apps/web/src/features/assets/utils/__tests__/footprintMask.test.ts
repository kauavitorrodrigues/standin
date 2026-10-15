import { describe, expect, it } from "vitest";
import { describeFootprint } from "../describeFootprint";
import {
    buildMaskField,
    canHaveMask,
    countOccupiedTiles,
    getTileAtCell,
    isTileOccupied,
    toggleMaskTile,
    toPayloadMask,
} from "../footprintMask";
import { buildAssetData } from "../buildData";
import { validateCreateAsset } from "../validateCreate";
import { createValues } from "./fixtures";

const footprint = { w: 2, h: 2, offsetX: 0 };

describe("toggleMaskTile", () => {
    it("frees a tile of a full footprint", () => {
        expect(toggleMaskTile(footprint, null, { col: 1, row: 0 })).toEqual([
            [true, false],
            [true, true],
        ]);
    });

    it("occupies it again and goes back to null when full", () => {
        const mask = [
            [true, false],
            [true, true],
        ];
        expect(toggleMaskTile(footprint, mask, { col: 1, row: 0 })).toBeNull();
    });

    it("keeps the last occupied tile", () => {
        const mask = [
            [false, false],
            [false, true],
        ];
        expect(toggleMaskTile(footprint, mask, { col: 1, row: 1 })).toBe(mask);
    });

    it("ignores a tile outside the footprint", () => {
        expect(toggleMaskTile(footprint, null, { col: 2, row: 0 })).toBeNull();
    });
});

describe("mask reading", () => {
    it("counts the occupied tiles", () => {
        expect(countOccupiedTiles(footprint, null)).toBe(4);
        expect(
            countOccupiedTiles(footprint, [
                [true, false],
                [true, true],
            ])
        ).toBe(3);
    });

    it("reads a tile, all occupied without a mask", () => {
        expect(isTileOccupied(null, { col: 1, row: 1 })).toBe(true);
        expect(isTileOccupied([[false]], { col: 0, row: 0 })).toBe(false);
    });

    it("only a footprint of more than one tile can have a mask", () => {
        expect(canHaveMask({ w: 1, h: 1, offsetX: 0 })).toBe(false);
        expect(canHaveMask(footprint)).toBe(true);
    });

    it("finds the tile under a cell, counted from the bottom of the frame", () => {
        const frame = { x: 0, y: 32, w: 96, h: 96 };
        const placed = { w: 2, h: 2, offsetX: 1 };
        expect(getTileAtCell(frame, placed, { col: 1, row: 2 })).toEqual({
            col: 0,
            row: 0,
        });
        expect(getTileAtCell(frame, placed, { col: 2, row: 3 })).toEqual({
            col: 1,
            row: 1,
        });
        expect(getTileAtCell(frame, placed, { col: 0, row: 3 })).toBeNull();
        expect(getTileAtCell(frame, placed, { col: 1, row: 1 })).toBeNull();
    });
});

describe("payload", () => {
    const mask = [
        [true, false],
        [true, true],
    ];

    it("drops the mask of an animated asset or a full one", () => {
        expect(toPayloadMask(mask, true)).toBeNull();
        expect(toPayloadMask([[true, true]], false)).toBeNull();
        expect(toPayloadMask(mask, false)).toBe(mask);
    });

    it("adds the mask key only when there is one", () => {
        expect(buildMaskField(null)).toEqual({});
        expect(buildMaskField(mask)).toEqual({ mask });
    });

    it("sends the mask in the footprint of the asset", () => {
        const data = buildAssetData(
            createValues({
                footprintW: 2,
                footprintH: 2,
                footprintMask: mask,
            })
        );
        expect(data.footprint).toEqual({ w: 2, h: 2, offsetX: 0, mask });
    });

    it("sends no mask for an animated asset", () => {
        const data = buildAssetData(
            createValues({
                footprintW: 2,
                footprintH: 2,
                footprintMask: mask,
                isAnimated: true,
            })
        );
        expect(data.footprint).toEqual({ w: 2, h: 2, offsetX: 0 });
    });
});

describe("validation", () => {
    it("refuses a mask that does not fit the footprint", () => {
        const errors = validateCreateAsset(
            createValues({
                footprintW: 2,
                footprintH: 2,
                footprintMask: [[true]],
            }),
            undefined
        );
        expect(errors.footprintMask).toBeDefined();
    });

    it("accepts a mask that fits", () => {
        const errors = validateCreateAsset(
            createValues({
                footprintW: 2,
                footprintH: 2,
                footprintMask: [
                    [true, false],
                    [true, true],
                ],
            }),
            undefined
        );
        expect(errors.footprintMask).toBeUndefined();
    });
});

describe("describeFootprint", () => {
    it("keeps the plain text without a mask", () => {
        expect(describeFootprint(footprint, null)).toBe(
            "2 × 2 tiles, deslocamento 0"
        );
    });

    it("counts the occupied tiles with a mask", () => {
        expect(
            describeFootprint(footprint, [
                [true, false],
                [true, true],
            ])
        ).toBe("2 × 2 tiles, 3 ocupados, deslocamento 0");
    });
});
