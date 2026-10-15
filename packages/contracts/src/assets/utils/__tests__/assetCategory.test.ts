import { describe, expect, it } from "vitest";
import { ASSET_TYPES } from "../../enums/asset-type";
import {
    ASSET_CATEGORIES,
    ASSET_CATEGORY_META,
    DEFAULT_CATEGORY_BY_TYPE,
} from "../../enums/asset-category";
import {
    AssetCategoryResolutionError,
    resolveAssetCategory,
} from "../assetCategory";

describe("ASSET_CATEGORY_META", () => {
    it("has an entry for every category with a unique order", () => {
        const categories = Object.keys(ASSET_CATEGORIES);
        expect(Object.keys(ASSET_CATEGORY_META).sort()).toEqual(
            categories.sort()
        );
        const orders = Object.values(ASSET_CATEGORY_META).map((m) => m.order);
        expect(new Set(orders).size).toBe(orders.length);
    });
});

describe("resolveAssetCategory", () => {
    const withDefault = Object.entries(DEFAULT_CATEGORY_BY_TYPE);

    it.each(withDefault)("defaults %s to %s", (type, category) => {
        expect(resolveAssetCategory(type as keyof typeof ASSET_TYPES)).toBe(
            category
        );
    });

    it("covers every type except DECORATION with a default", () => {
        const missing = Object.keys(ASSET_TYPES).filter(
            (type) => !(type in DEFAULT_CATEGORY_BY_TYPE)
        );
        expect(missing).toEqual(["DECORATION"]);
    });

    it("requires a category for DECORATION", () => {
        expect(() => resolveAssetCategory("DECORATION")).toThrow(
            expect.objectContaining({ code: "CATEGORY_REQUIRED" })
        );
    });

    it("lets an explicit value override the default", () => {
        expect(resolveAssetCategory("CHAIR", "OUTDOOR")).toBe("OUTDOOR");
        expect(resolveAssetCategory("DECORATION", "FOOD_DRINK")).toBe(
            "FOOD_DRINK"
        );
    });

    it("rejects a value outside the enum", () => {
        expect(() => resolveAssetCategory("CHAIR", "NOPE")).toThrow(
            AssetCategoryResolutionError
        );
        expect(() => resolveAssetCategory("CHAIR", "NOPE")).toThrow(
            expect.objectContaining({ code: "CATEGORY_INVALID" })
        );
    });
});
