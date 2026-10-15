import type { LucideIcon } from "lucide-react";
import type { TILE_CATEGORIES, TileMeta } from "@standin/contracts";

export type TileCategory =
    (typeof TILE_CATEGORIES)[keyof typeof TILE_CATEGORIES];

// What the tileset says about one tile, as the API keeps it.
export type TileMetaEntry = TileMeta[string];

// Whether the tile may be changed. A tile that maps already use only accepts
// a change of `blankDefault`.
export type CanEditTile = (index: number) => boolean;

export type TileCategoryMeta = {
    value: TileCategory;
    label: string;
    color: string;
    icon: LucideIcon;
    // The key that gives a tile this category.
    shortcut: string;
};
