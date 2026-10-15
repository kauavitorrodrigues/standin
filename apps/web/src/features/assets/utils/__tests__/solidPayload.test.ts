import { describe, expect, it } from "vitest";
import { buildAssetData } from "../buildData";
import { buildVariantData } from "../buildVariantData";
import { describeFootprint, describeFormFootprint } from "../describeFootprint";
import { fillSolidMask } from "../solidMask";
import { validateAddVariant } from "../validateAddVariant";
import { validateCreateAsset } from "../validateCreate";
import { family, createValues, png } from "./fixtures";
import type { AddVariantFormValues } from "../../types/addVariantForm";

const footprint = { w: 2, h: 1, offsetX: 0 };

const cellsWith = (solid: [number, number][]) => {
    const cells = Array.from({ length: 4 }, () => Array(8).fill(false));
    for (const [col, row] of solid) cells[row][col] = true;
    return cells;
};

const stillDesk = (overrides = {}) =>
    createValues({
        solid: true,
        footprintW: 2,
        footprintH: 1,
        footprintSolidMask: cellsWith([[0, 0]]),
        ...overrides,
    });

describe("buildAssetData with a collision mask", () => {
    it("sends it for a still asset that blocks", () => {
        const data = buildAssetData(stillDesk());
        expect(data.footprint.solidMask).toEqual(cellsWith([[0, 0]]));
        expect(data.footprint.mask).toBeUndefined();
    });

    it("does not send it when the asset does not block", () => {
        const data = buildAssetData(stillDesk({ solid: false }));
        expect(data.footprint).not.toHaveProperty("solidMask");
    });

    it("does not send it for an animated asset", () => {
        const data = buildAssetData(stillDesk({ isAnimated: true }));
        expect(data.footprint).not.toHaveProperty("solidMask");
    });

    it("does not send it when it is null", () => {
        const data = buildAssetData(stillDesk({ footprintSolidMask: null }));
        expect(data.footprint).not.toHaveProperty("solidMask");
    });

    it("keeps sending the tile mask", () => {
        const data = buildAssetData(
            stillDesk({ footprintMask: [[true, false]] })
        );
        expect(data.footprint.mask).toEqual([[true, false]]);
    });

    it("works the tile mask out when it would conflict with the cells", () => {
        const data = buildAssetData(
            stillDesk({
                footprintMask: [[false, true]],
                footprintSolidMask: cellsWith([[0, 0]]),
            })
        );
        expect(data.footprint.mask).toEqual([[true, false]]);
    });
});

describe("buildVariantData with a collision mask", () => {
    const values = (
        overrides: Partial<AddVariantFormValues> = {}
    ): AddVariantFormValues => ({
        image: [png()],
        colorKey: "",
        colorHex: "",
        rotation: "DEG_90",
        footprintW: 2,
        footprintH: 1,
        footprintOffsetX: 0,
        footprintMask: null,
        footprintSolidMask: cellsWith([[0, 0]]),
        seats: [],
        targetX: undefined,
        targetY: undefined,
        ...overrides,
    });
    const solidFamily = () => {
        const base = family([null]);
        return {
            ...base,
            variants: base.variants.map((variant) => ({
                ...variant,
                solid: true,
            })),
        };
    };

    it("sends it when the base blocks", () => {
        const data = buildVariantData(solidFamily(), values());
        expect(data.footprint?.solidMask).toEqual(cellsWith([[0, 0]]));
    });

    it("leaves it out when the base does not block", () => {
        const data = buildVariantData(family([null]), values());
        expect(data.footprint).not.toHaveProperty("solidMask");
    });

    it("refuses a collision mask of the wrong size", () => {
        const errors = validateAddVariant(
            solidFamily(),
            values({ footprintSolidMask: [[true]] })
        );
        expect(errors.footprintSolidMask).toBeDefined();
    });

    it("accepts a collision mask that fits", () => {
        const errors = validateAddVariant(solidFamily(), values());
        expect(errors.footprintSolidMask).toBeUndefined();
    });
});

describe("validateCreateAsset with a collision mask", () => {
    it("accepts one that fits", () => {
        expect(
            validateCreateAsset(stillDesk(), undefined).footprintSolidMask
        ).toBeUndefined();
    });

    it("refuses one of the wrong size", () => {
        const errors = validateCreateAsset(
            stillDesk({ footprintSolidMask: [[true]] }),
            undefined
        );
        expect(errors.footprintSolidMask).toBeDefined();
    });

    it("refuses a solid cell in a free tile", () => {
        const errors = validateCreateAsset(
            stillDesk({ footprintMask: [[false, true]] }),
            undefined
        );
        expect(errors.footprintSolidMask).toBeDefined();
    });

    it("refuses a mask without any solid cell", () => {
        const errors = validateCreateAsset(
            stillDesk({ footprintSolidMask: cellsWith([]) }),
            undefined
        );
        expect(errors.footprintSolidMask).toBeDefined();
    });

    it("does not check one that is not sent", () => {
        const errors = validateCreateAsset(
            stillDesk({ solid: false, footprintSolidMask: [[true]] }),
            undefined
        );
        expect(errors.footprintSolidMask).toBeUndefined();
    });
});

describe("describeFootprint with a collision mask", () => {
    it("adds the solid cells", () => {
        expect(
            describeFootprint(
                { w: 5, h: 4, offsetX: 0 },
                Array.from({ length: 4 }, () => [
                    true,
                    true,
                    true,
                    true,
                    false,
                ]),
                Array.from({ length: 16 }, (_, y) =>
                    Array.from({ length: 20 }, (_, x) => y < 7 && x < 20)
                )
            )
        ).toBe("5 × 4 tiles, 16 ocupados, 140 células sólidas, deslocamento 0");
    });

    it("says nothing of cells without a collision mask", () => {
        expect(describeFootprint(footprint, null, null)).toBe(
            "2 × 1 tiles, deslocamento 0"
        );
    });

    it("only counts the cells the form sends", () => {
        const values = {
            footprintW: 2,
            footprintH: 1,
            footprintSolidMask: cellsWith([
                [0, 0],
                [1, 0],
            ]),
            solid: true,
        };
        expect(describeFormFootprint(true, values)).toBe(
            "2 × 1 tiles, 2 células sólidas, deslocamento 0"
        );
        expect(describeFormFootprint(true, { ...values, solid: false })).toBe(
            "2 × 1 tiles, deslocamento 0"
        );
        expect(
            describeFormFootprint(true, {
                ...values,
                footprintSolidMask: fillSolidMask(footprint, null),
            })
        ).toBe("2 × 1 tiles, deslocamento 0");
    });
});
