import { ASSET_TYPES } from "./asset-type";

// Palette tab of an asset. It only organizes the editor palette, the rules
// come from the type and the action.
export const ASSET_CATEGORIES = {
    SITTING: "SITTING",
    TABLES: "TABLES",
    SHELVES: "SHELVES",
    MACHINES: "MACHINES",
    FOOD_DRINK: "FOOD_DRINK",
    ROOM_DECOR: "ROOM_DECOR",
    WALL_DECOR: "WALL_DECOR",
    OUTDOOR: "OUTDOOR",
} as const;

export type AssetCategory = keyof typeof ASSET_CATEGORIES;

type AssetType = keyof typeof ASSET_TYPES;

// `icon` is a lucide icon key, resolved by the client.
export const ASSET_CATEGORY_META: Record<
    AssetCategory,
    { label: string; order: number; icon: string }
> = {
    SITTING: { label: "Sentar", order: 1, icon: "armchair" },
    TABLES: { label: "Mesas", order: 2, icon: "table" },
    SHELVES: { label: "Estantes", order: 3, icon: "library" },
    MACHINES: { label: "Máquinas", order: 4, icon: "monitor" },
    FOOD_DRINK: { label: "Comida e bebida", order: 5, icon: "coffee" },
    ROOM_DECOR: { label: "Decoração de ambiente", order: 6, icon: "lamp" },
    WALL_DECOR: { label: "Decoração de parede", order: 7, icon: "image" },
    OUTDOOR: { label: "Externo", order: 8, icon: "trees" },
};

// DECORATION has no default: it is generic, so the category is required.
export const DEFAULT_CATEGORY_BY_TYPE: Partial<
    Record<AssetType, AssetCategory>
> = {
    CHAIR: "SITTING",
    SOFA: "SITTING",
    TABLE: "TABLES",
    DESK: "TABLES",
    TV: "MACHINES",
    MONITOR: "MACHINES",
    PLANT: "ROOM_DECOR",
    RUG: "ROOM_DECOR",
    DOOR: "ROOM_DECOR",
    WINDOW: "WALL_DECOR",
    POSTER: "WALL_DECOR",
    TREE: "OUTDOOR",
};
