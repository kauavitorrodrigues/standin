import { describe, expect, it } from "vitest";
import {
    AssetDefinitionSchema,
    SOLID_MASK_SUBDIVISION,
    isFootprintMaskFitting,
    isFootprintSolidMaskFitting,
} from "@standin/contracts";
import { createFootprintMasks, createRectMask } from "../masks/footprintMasks";
import { asset } from "./kit";

const S = SOLID_MASK_SUBDIVISION;

describe("createRectMask", () => {
    it("sets every cell without a rectangle", () => {
        expect(createRectMask(3, 2)).toEqual([
            [true, true, true],
            [true, true, true],
        ]);
    });

    it("sets only the cells of the rectangle", () => {
        expect(createRectMask(4, 3, { x: 1, y: 1, w: 2, h: 2 })).toEqual([
            [false, false, false, false],
            [false, true, true, false],
            [false, true, true, false],
        ]);
    });

    it("ignores the part of the rectangle outside the mask", () => {
        const mask = createRectMask(2, 2, { x: 1, y: 1, w: 5, h: 5 });

        expect(mask).toEqual([
            [false, false],
            [false, true],
        ]);
    });
});

describe("createFootprintMasks", () => {
    it("answers no masks when nothing is asked", () => {
        expect(createFootprintMasks({ w: 2, h: 1 })).toEqual({
            ok: true,
            mask: null,
            solidMask: null,
        });
    });

    it("builds masks at SOLID_MASK_SUBDIVISION cells per tile", () => {
        const result = createFootprintMasks({
            w: 2,
            h: 1,
            occupied: { x: 0, y: 0, w: 2 * S, h: S },
            solid: { x: 0, y: S / 2, w: 2 * S, h: S / 2 },
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        expect(result.mask).toHaveLength(S);
        expect(result.mask?.[0]).toHaveLength(2 * S);
        expect(result.solidMask?.[0]?.every((cell) => !cell)).toBe(true);
        expect(result.solidMask?.[S - 1]?.every(Boolean)).toBe(true);
    });

    it("builds masks the asset schema and the footprint checks accept", () => {
        const result = createFootprintMasks({
            w: 2,
            h: 2,
            occupied: { x: 0, y: S, w: 2 * S, h: S },
            solid: { x: 0, y: S + 1, w: 2 * S, h: S - 1 },
        });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        const footprint = {
            w: 2,
            h: 2,
            offsetX: 0,
            mask: result.mask,
            solidMask: result.solidMask,
        };

        expect(isFootprintMaskFitting(footprint)).toBe(true);
        expect(isFootprintSolidMaskFitting(footprint)).toBe(true);
        expect(
            AssetDefinitionSchema.safeParse(asset({ footprint })).success
        ).toBe(true);
    });

    it("refuses an occupied rectangle with no cell inside", () => {
        const result = createFootprintMasks({
            w: 1,
            h: 1,
            occupied: { x: 10, y: 10, w: 2, h: 2 },
        });

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues[0]).toMatchObject({
            code: "AUTHORING_INVALID_MASK",
            path: "footprint.mask",
        });
    });

    it("refuses a solid rectangle outside the occupied cells", () => {
        const result = createFootprintMasks({
            w: 1,
            h: 1,
            occupied: { x: 0, y: 0, w: 2, h: 2 },
            solid: { x: 2, y: 2, w: 2, h: 2 },
        });

        expect(result.ok).toBe(false);
        if (result.ok) return;
        expect(result.issues[0]).toMatchObject({ path: "footprint.solidMask" });
    });
});
