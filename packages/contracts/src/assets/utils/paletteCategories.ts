import { ASSET_CATEGORY_META } from "../enums/asset-category";
import type { AssetCategory } from "../enums/asset-category";
import type { FamilyMember } from "./assetFamily";

type PaletteAsset = FamilyMember & {
    name: string;
    category: AssetCategory;
};

// Lowercase and without accents, so "Cadeira" and "cadeira" are equal.
const normalize = (text: string) =>
    text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();

const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });

// One entry per family: its base asset.
const representatives = <T extends PaletteAsset>(assets: T[]): T[] =>
    assets.filter((asset) => asset.baseAssetId === null);

/**
 * Category to families (their representatives, by name). Categories without
 * any asset are left out, and the map follows `ASSET_CATEGORY_META` order.
 */
export const groupFamiliesByCategory = <T extends PaletteAsset>(
    assets: T[]
): Map<AssetCategory, T[]> => {
    const byCategory = new Map<AssetCategory, T[]>();
    for (const representative of representatives(assets)) {
        const group = byCategory.get(representative.category) ?? [];
        group.push(representative);
        byCategory.set(representative.category, group);
    }

    const ordered = (Object.keys(ASSET_CATEGORY_META) as AssetCategory[])
        .filter((category) => byCategory.has(category))
        .sort(
            (a, b) =>
                ASSET_CATEGORY_META[a].order - ASSET_CATEGORY_META[b].order
        );
    return new Map(
        ordered.map((category) => [
            category,
            [...byCategory.get(category)!].sort(byName),
        ])
    );
};

/** Families whose name matches the search, across every category. */
export const searchFamilies = <T extends PaletteAsset>(
    assets: T[],
    query: string
): T[] => {
    const term = normalize(query.trim());
    if (term === "") return [];
    return representatives(assets)
        .filter(({ name }) => normalize(name).includes(term))
        .sort(byName);
};
