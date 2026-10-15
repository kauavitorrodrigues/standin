import { ArrowDownToLineIcon, BrickWallIcon, LayersIcon } from "lucide-react";
import type { ASSET_PLACEMENTS } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";

type AssetPlacement = keyof typeof ASSET_PLACEMENTS;

export const ASSET_PLACEMENT_META: Record<AssetPlacement, MetaItem> = {
    GROUND: { label: "No chão", icon: ArrowDownToLineIcon, color: "#78716C" },
    SURFACE: {
        label: "Sobre uma superfície",
        icon: LayersIcon,
        color: "#0EA5E9",
    },
    WALL: { label: "Na parede", icon: BrickWallIcon, color: "#EF4444" },
};
