import { SparklesIcon } from "lucide-react";
import { ASSET_CATEGORY_META, type AssetCategory } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";
import { CATEGORY_ICONS } from "./categoryIcons";

// Label and icon key come from `@standin/contracts`, the color is the
// client's.
const CATEGORY_COLORS: Record<AssetCategory, string> = {
    SITTING: "#F59E0B",
    TABLES: "#B45309",
    SHELVES: "#8B5CF6",
    MACHINES: "#3B82F6",
    FOOD_DRINK: "#F97316",
    ROOM_DECOR: "#EAB308",
    WALL_DECOR: "#F43F5E",
    OUTDOOR: "#16A34A",
};

export const ASSET_CATEGORY_DISPLAY_META = Object.fromEntries(
    (Object.keys(ASSET_CATEGORY_META) as AssetCategory[]).map((category) => [
        category,
        {
            label: ASSET_CATEGORY_META[category].label,
            icon:
                CATEGORY_ICONS[ASSET_CATEGORY_META[category].icon] ??
                SparklesIcon,
            color: CATEGORY_COLORS[category],
        },
    ])
) as Record<AssetCategory, MetaItem>;

// The option that leaves the category to the default of the type.
export const DEFAULT_CATEGORY_META: MetaItem = {
    label: "Padrão do tipo",
    icon: SparklesIcon,
    color: "var(--muted-foreground)",
};
