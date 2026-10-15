import {
    BrickWallIcon,
    LayoutGridIcon,
    PanelTopIcon,
    SparklesIcon,
    SquareDashedIcon,
} from "lucide-react";
import { TILE_CATEGORIES } from "@standin/contracts";
import type { TileCategory, TileCategoryMeta } from "../types/meta";

export const TILE_CATEGORY_META: readonly TileCategoryMeta[] = [
    {
        value: TILE_CATEGORIES.FLOOR,
        label: "Chão",
        color: "#22C55E",
        icon: LayoutGridIcon,
        shortcut: "1",
    },
    {
        value: TILE_CATEGORIES.WALL,
        label: "Parede",
        color: "#F97316",
        icon: BrickWallIcon,
        shortcut: "2",
    },
    {
        value: TILE_CATEGORIES.CEILING,
        label: "Teto",
        color: "#A855F7",
        icon: PanelTopIcon,
        shortcut: "3",
    },
    {
        value: TILE_CATEGORIES.DECORATION,
        label: "Decoração",
        color: "#EAB308",
        icon: SparklesIcon,
        shortcut: "4",
    },
    {
        value: TILE_CATEGORIES.EMPTY,
        label: "Vazio",
        color: "#EC4899",
        icon: SquareDashedIcon,
        shortcut: "5",
    },
];

export const getTileCategoryMeta = (category: TileCategory) =>
    TILE_CATEGORY_META.find(({ value }) => value === category)!;

export const UNTAGGED_COLOR = "#94A3B8";
export const TILE_SELECTION_COLOR = "var(--primary)";
export const TILE_TOP_COLOR = "#22D3EE";
