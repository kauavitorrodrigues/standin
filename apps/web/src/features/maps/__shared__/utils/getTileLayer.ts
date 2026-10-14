import { LAYER_BY_CATEGORY } from "@standin/contracts";

// The layer a tile of this category is painted on. Null for a category that
// has none (the EMPTY tile).
export const getTileLayer = (category: string): string | null =>
    LAYER_BY_CATEGORY[category] ?? null;
