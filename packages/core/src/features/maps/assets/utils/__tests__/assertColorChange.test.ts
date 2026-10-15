import { describe, expect, it } from "vitest";
import {
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    AssetColorChangeInvalidTargetError,
} from "@standin/contracts";
import type { AssetDef } from "../../types/asset-def";
import type { Item } from "../../types/item";
import { assertColorChange } from "../assertColorChange";

const def = (overrides: Partial<AssetDef> = {}): AssetDef => ({
    id: "mug-blue",
    baseAssetId: "mug-red",
    rotation: null,
    colorKey: "blue",
    type: ASSET_TYPES.DECORATION,
    placement: ASSET_PLACEMENTS.SURFACE,
    footprintW: 1,
    footprintH: 1,
    ...overrides,
});

const current: Item = {
    ...def({ id: "mug-red", baseAssetId: null, colorKey: "red" }),
    rowId: "row",
    assetId: "mug-red",
    tileX: 3,
    tileY: 4,
    parentId: "desk",
};

describe("assertColorChange", () => {
    it("accepts a sibling with another color", () => {
        expect(() => assertColorChange(current, def())).not.toThrow();
    });

    it("refuses another family, rotation or the same color", () => {
        const invalid = [
            def({ baseAssetId: "monitor" }),
            def({ id: "monitor", baseAssetId: null }),
            def({ rotation: "DEG_90" }),
            def({ colorKey: "red" }),
        ];
        for (const target of invalid) {
            expect(() => assertColorChange(current, target)).toThrow(
                AssetColorChangeInvalidTargetError
            );
        }
    });

    it("refuses a target without color and a missing target", () => {
        expect(() =>
            assertColorChange(current, def({ colorKey: null }))
        ).toThrow(AssetColorChangeInvalidTargetError);
        expect(() => assertColorChange(current, null)).toThrow(
            AssetColorChangeInvalidTargetError
        );
    });

    it("carries the 422 code", () => {
        const error = new AssetColorChangeInvalidTargetError();
        expect(error.status).toBe(422);
        expect(error.code).toBe("COLOR_CHANGE_INVALID_TARGET");
    });
});
