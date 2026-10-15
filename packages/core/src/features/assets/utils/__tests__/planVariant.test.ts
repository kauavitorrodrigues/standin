import { describe, expect, it } from "vitest";
import {
    ASSET_ACTIONS,
    ASSET_ROTATIONS,
    ASSET_TYPES,
    LIBRARY_ISSUE_CODES,
} from "@standin/contracts";
import type { CreateVariantData } from "@standin/contracts";
import { planVariant } from "../planVariant";
import { assetRow, chairSeats } from "./fixtures";

const BLUE = { key: "blue", hex: "#3F6FD1" };
const FRAME = { width: 32, height: 32 };

const base = assetRow();
const codes = (
    data: CreateVariantData,
    options: {
        baseRow?: ReturnType<typeof assetRow>;
        family?: ReturnType<typeof assetRow>[];
        size?: { width: number; height: number } | null;
    } = {}
) => {
    const baseRow = options.baseRow ?? base;
    return planVariant(
        baseRow,
        options.family ?? [baseRow],
        data,
        options.size === undefined ? FRAME : options.size
    ).errors.map(({ code }) => code);
};

describe("planVariant, a color on a rotation the family has", () => {
    it("copies the footprint and the action params of the sibling", () => {
        const sibling = assetRow({
            footprintW: 2,
            footprintOffsetX: 1,
            actionParams: null,
        });
        const plan = planVariant(
            sibling,
            [sibling],
            { color: BLUE },
            {
                width: 32,
                height: 32,
            }
        );

        expect(plan.errors).toEqual([]);
        expect(plan.values).toMatchObject({
            footprint: { w: 2, h: 1, offsetX: 1 },
            copiesSibling: true,
            color: BLUE,
        });
    });

    it("refuses overrides of the footprint and the action params", () => {
        expect(
            codes({
                color: BLUE,
                footprint: { w: 1, h: 1 },
                actionParams: chairSeats,
            })
        ).toEqual([
            LIBRARY_ISSUE_CODES.VARIANT_OVERRIDE_NOT_ALLOWED,
            LIBRARY_ISSUE_CODES.VARIANT_OVERRIDE_NOT_ALLOWED,
        ]);
    });

    it("refuses a frame size that differs from the sibling", () => {
        expect(
            codes({ color: BLUE }, { size: { width: 64, height: 32 } })
        ).toEqual([LIBRARY_ISSUE_CODES.VARIANT_SIZE_MISMATCH]);
    });

    it("refuses a color the family already has", () => {
        expect(codes({ color: { key: "red", hex: "#D64545" } })).toEqual([
            LIBRARY_ISSUE_CODES.VARIANT_DUPLICATED,
        ]);
    });

    it("refuses a color when the base has none", () => {
        const plain = assetRow({ colorKey: null, colorHex: null });

        expect(codes({ color: BLUE }, { baseRow: plain })).toEqual([
            LIBRARY_ISSUE_CODES.BASE_COLOR_REQUIRED,
        ]);
    });
});

describe("planVariant, the footprint mask of a color", () => {
    it("copies the mask of the sibling", () => {
        const mask = [[true, false]];
        const sibling = assetRow({ footprintW: 2, footprintMask: mask });
        const plan = planVariant(
            sibling,
            [sibling],
            { color: BLUE },
            { width: 32, height: 32 }
        );

        expect(plan.errors).toEqual([]);
        expect(plan.values?.footprint.mask).toEqual(mask);
    });
});

describe("planVariant, the collision mask of a color", () => {
    it("copies the collision mask of the sibling", () => {
        const solidMask = Array.from({ length: 4 }, () => [
            true,
            false,
            false,
            false,
        ]);
        const sibling = assetRow({ footprintSolidMask: solidMask });
        const plan = planVariant(
            sibling,
            [sibling],
            { color: BLUE },
            { width: 32, height: 32 }
        );

        expect(plan.errors).toEqual([]);
        expect(plan.values?.footprint.solidMask).toEqual(solidMask);
    });
});

describe("planVariant, a new rotation", () => {
    const chair = assetRow({
        id: "chair",
        type: ASSET_TYPES.CHAIR,
        action: ASSET_ACTIONS.SIT,
        actionParams: chairSeats,
        colorKey: "oak",
        colorHex: "#B98B5E",
    });
    const oak = { key: "walnut", hex: "#5C4033" };

    it("needs the footprint and the action params", () => {
        expect(
            codes(
                { rotation: ASSET_ROTATIONS.DEG_90, color: oak },
                { baseRow: chair }
            )
        ).toEqual([
            LIBRARY_ISSUE_CODES.FOOTPRINT_REQUIRED_FOR_NEW_ROTATION,
            LIBRARY_ISSUE_CODES.FOOTPRINT_REQUIRED_FOR_NEW_ROTATION,
        ]);
    });

    it("accepts the footprint and action params of the rotation", () => {
        const plan = planVariant(
            chair,
            [chair],
            {
                rotation: ASSET_ROTATIONS.DEG_90,
                color: oak,
                footprint: { w: 1, h: 2 },
                actionParams: {
                    seats: [{ dx: 16, dy: -8, facing: "LEFT" }],
                },
            },
            { width: 32, height: 64 }
        );

        expect(plan.errors).toEqual([]);
        expect(plan.values).toMatchObject({
            rotation: ASSET_ROTATIONS.DEG_90,
            footprint: { w: 1, h: 2, offsetX: 0 },
            copiesSibling: false,
        });
    });

    it("takes the footprint mask of the new rotation", () => {
        const mask = [[true], [false]];
        const plan = planVariant(
            chair,
            [chair],
            {
                rotation: ASSET_ROTATIONS.DEG_90,
                color: oak,
                footprint: { w: 1, h: 2, mask },
                actionParams: chairSeats,
            },
            { width: 32, height: 64 }
        );

        expect(plan.errors).toEqual([]);
        expect(plan.values?.footprint.mask).toEqual(mask);
    });

    it("refuses a footprint that does not fit its own frame", () => {
        expect(
            codes(
                {
                    rotation: ASSET_ROTATIONS.DEG_90,
                    color: oak,
                    footprint: { w: 1, h: 3 },
                    actionParams: chairSeats,
                },
                { baseRow: chair, size: { width: 32, height: 64 } }
            )
        ).toEqual([LIBRARY_ISSUE_CODES.ASSET_FOOTPRINT_INVALID]);
    });
});

describe("planVariant, an animated base", () => {
    const door = assetRow({
        colorKey: "oak",
        colorHex: "#B98B5E",
        animation: { frameCount: 6, frameDurationMs: 100, repeat: -1 },
    });

    it("needs the strip to have the frame count of the base", () => {
        const plan = planVariant(
            door,
            [door],
            { color: BLUE },
            { width: 192, height: 32 }
        );
        expect(plan.errors).toEqual([]);
        expect(plan.values?.frame).toEqual({ w: 32, h: 32 });

        expect(
            planVariant(
                door,
                [door],
                { color: BLUE },
                { width: 160, height: 32 }
            ).errors[0]?.code
        ).toBe(LIBRARY_ISSUE_CODES.ANIMATION_FRAME_WIDTH_INVALID);
    });

    it("refuses a strip with the wrong width for the sibling frame", () => {
        expect(
            planVariant(
                door,
                [door],
                { color: BLUE },
                { width: 384, height: 32 }
            ).errors[0]?.code
        ).toBe(LIBRARY_ISSUE_CODES.VARIANT_SIZE_MISMATCH);
    });
});
