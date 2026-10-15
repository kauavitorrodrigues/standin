import { describe, expect, it } from "vitest";
import {
    ASSET_ACTIONS,
    ASSET_CATEGORIES,
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    LIBRARY_ISSUE_CODES,
    expandTileMask,
} from "@standin/contracts";
import type { CreateAssetData } from "@standin/contracts";
import { planAsset } from "../planAsset";
import { chairSeats } from "./fixtures";

const mug: CreateAssetData = {
    name: "Caneca",
    type: ASSET_TYPES.DECORATION,
    category: ASSET_CATEGORIES.FOOD_DRINK,
    placement: ASSET_PLACEMENTS.SURFACE,
    footprint: { w: 1, h: 1 },
};

const codes = (data: CreateAssetData, size = { width: 32, height: 32 }) =>
    planAsset(data, size).errors.map(({ code }) => code);

describe("planAsset", () => {
    it("accepts a static base and derives the frame from the PNG", () => {
        const plan = planAsset(mug, { width: 32, height: 64 });

        expect(plan.errors).toEqual([]);
        expect(plan.values).toEqual({
            category: ASSET_CATEGORIES.FOOD_DRINK,
            frame: { w: 32, h: 64 },
            footprint: { w: 1, h: 1, offsetX: 0, mask: null, solidMask: null },
        });
    });

    it("accepts an animated base and reads the frame from the strip", () => {
        const door: CreateAssetData = {
            name: "Porta",
            type: ASSET_TYPES.DOOR,
            footprint: { w: 1, h: 2 },
            animation: { frameCount: 6, frameDurationMs: 100, repeat: -1 },
        };

        const plan = planAsset(door, { width: 192, height: 64 });

        expect(plan.errors).toEqual([]);
        expect(plan.values?.frame).toEqual({ w: 32, h: 64 });
    });

    it("takes the default category of the type", () => {
        const chair: CreateAssetData = {
            name: "Cadeira",
            type: ASSET_TYPES.CHAIR,
            footprint: { w: 1, h: 1 },
            action: ASSET_ACTIONS.SIT,
            actionParams: chairSeats,
        };

        expect(
            planAsset(chair, { width: 32, height: 32 }).values?.category
        ).toBe(ASSET_CATEGORIES.SITTING);
    });

    it("requires a category on a DECORATION", () => {
        expect(codes({ ...mug, category: undefined })).toEqual([
            LIBRARY_ISSUE_CODES.CATEGORY_REQUIRED,
        ]);
    });

    it("refuses a category that does not exist", () => {
        expect(codes({ ...mug, category: "NOPE" })).toEqual([
            LIBRARY_ISSUE_CODES.CATEGORY_INVALID,
        ]);
    });

    it("refuses a frame that is not a multiple of 32", () => {
        expect(codes(mug, { width: 40, height: 32 })).toEqual([
            LIBRARY_ISSUE_CODES.SPRITE_SIZE_NOT_MULTIPLE_OF_TILE,
        ]);
    });

    it("refuses a width that the frame count does not divide", () => {
        const animated = {
            ...mug,
            animation: { frameCount: 3, frameDurationMs: 100, repeat: -1 },
        };

        expect(codes(animated, { width: 160, height: 32 })).toEqual([
            LIBRARY_ISSUE_CODES.ANIMATION_FRAME_WIDTH_INVALID,
        ]);
    });

    it("refuses a footprint that does not fit the frame", () => {
        expect(codes({ ...mug, footprint: { w: 2, h: 1 } })).toEqual([
            LIBRARY_ISSUE_CODES.ASSET_FOOTPRINT_INVALID,
        ]);
        expect(
            codes({ ...mug, footprint: { w: 1, h: 1, offsetX: 1 } })
        ).toEqual([LIBRARY_ISSUE_CODES.ASSET_FOOTPRINT_INVALID]);
    });

    it("refuses action params without an action", () => {
        expect(codes({ ...mug, actionParams: chairSeats })).toEqual([
            LIBRARY_ISSUE_CODES.ASSET_ACTION_PARAMS_INVALID,
        ]);
    });

    it("keeps the footprint mask of a static asset", () => {
        const mask = expandTileMask([
            [true, true],
            [true, false],
        ]);
        const plan = planAsset(
            { ...mug, footprint: { w: 2, h: 2, mask } },
            { width: 64, height: 64 }
        );

        expect(plan.errors).toEqual([]);
        expect(plan.values?.footprint.mask).toEqual(mask);
    });

    it("keeps a collision mask sent alone, with the footprint whole", () => {
        // One tile wide and two high: only cells of the top tile are solid.
        const solidMask = Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 4 }, () => row === 0)
        );
        const plan = planAsset(
            { ...mug, footprint: { w: 1, h: 2, solidMask } },
            { width: 32, height: 64 }
        );

        expect(plan.errors).toEqual([]);
        expect(plan.values?.footprint.solidMask).toEqual(solidMask);
        expect(plan.values?.footprint.mask).toBeNull();
    });

    it("refuses a collision mask on an animated asset", () => {
        expect(
            codes(
                {
                    ...mug,
                    footprint: {
                        w: 1,
                        h: 1,
                        solidMask: Array.from({ length: 4 }, () =>
                            Array(4).fill(true)
                        ),
                    },
                    animation: {
                        frameCount: 2,
                        frameDurationMs: 100,
                        repeat: -1,
                    },
                },
                { width: 64, height: 32 }
            )
        ).toEqual([LIBRARY_ISSUE_CODES.ASSET_FOOTPRINT_MASK_ANIMATED]);
    });

    it("refuses a footprint mask on an animated asset", () => {
        expect(
            codes(
                {
                    ...mug,
                    footprint: { w: 1, h: 1, mask: [[true]] },
                    animation: {
                        frameCount: 2,
                        frameDurationMs: 100,
                        repeat: -1,
                    },
                },
                { width: 64, height: 32 }
            )
        ).toEqual([LIBRARY_ISSUE_CODES.ASSET_FOOTPRINT_MASK_ANIMATED]);
    });

    it("collects every problem together", () => {
        const plan = planAsset(
            { ...mug, category: undefined, footprint: { w: 3, h: 1 } },
            { width: 32, height: 32 }
        );

        expect(plan.values).toBeNull();
        expect(plan.errors.map(({ code }) => code)).toEqual([
            LIBRARY_ISSUE_CODES.CATEGORY_REQUIRED,
            LIBRARY_ISSUE_CODES.ASSET_FOOTPRINT_INVALID,
        ]);
    });
});
