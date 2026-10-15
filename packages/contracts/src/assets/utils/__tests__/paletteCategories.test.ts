import { describe, expect, it } from "vitest";
import type { AssetCategory } from "../../enums/asset-category";
import { groupFamiliesByCategory, searchFamilies } from "../paletteCategories";

const asset = (
    id: string,
    name: string,
    category: AssetCategory,
    baseAssetId: string | null = null
) => ({
    id,
    baseAssetId,
    name,
    category,
    rotation: null,
    colorKey: null,
});

const library = [
    asset("1", "Caneca", "FOOD_DRINK"),
    asset("2", "Caneca azul", "FOOD_DRINK"),
    asset("3", "Cadeira", "SITTING", "4"),
    asset("4", "Cadeira", "SITTING"),
    asset("5", "Estante", "SHELVES"),
    asset("6", "Café", "FOOD_DRINK"),
];

describe("groupFamiliesByCategory", () => {
    it("keeps empty categories and follows the meta order", () => {
        const grouped = groupFamiliesByCategory(library);
        expect([...grouped.keys()]).toEqual([
            "SITTING",
            "TABLES",
            "SHELVES",
            "MACHINES",
            "FOOD_DRINK",
            "ROOM_DECOR",
            "WALL_DECOR",
            "OUTDOOR",
        ]);
        expect(grouped.get("TABLES")).toEqual([]);
    });

    it("shows the base of each family, sorted by name", () => {
        const grouped = groupFamiliesByCategory(library);
        expect(grouped.get("SITTING")?.map(({ id }) => id)).toEqual(["4"]);
        expect(grouped.get("FOOD_DRINK")?.map(({ name }) => name)).toEqual([
            "Café",
            "Caneca",
            "Caneca azul",
        ]);
    });
});

describe("searchFamilies", () => {
    it("ignores accent and case and crosses categories", () => {
        expect(searchFamilies(library, "CAFE").map(({ id }) => id)).toEqual([
            "6",
        ]);
        expect(searchFamilies(library, "ca").map(({ name }) => name)).toEqual([
            "Cadeira",
            "Café",
            "Caneca",
            "Caneca azul",
        ]);
    });

    it("returns nothing for an empty query", () => {
        expect(searchFamilies(library, "  ")).toEqual([]);
    });
});
