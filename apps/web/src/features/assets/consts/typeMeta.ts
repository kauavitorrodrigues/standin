import {
    ArmchairIcon,
    DoorOpenIcon,
    ImageIcon,
    LaptopIcon,
    LeafIcon,
    MonitorIcon,
    RectangleHorizontalIcon,
    SofaIcon,
    SparklesIcon,
    TableIcon,
    TreePineIcon,
    TvIcon,
    AppWindowIcon,
} from "lucide-react";
import type { ASSET_TYPES } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";

type AssetType = keyof typeof ASSET_TYPES;

export const ASSET_TYPE_META: Record<AssetType, MetaItem> = {
    CHAIR: { label: "Cadeira", icon: ArmchairIcon, color: "#F59E0B" },
    TABLE: { label: "Mesa", icon: TableIcon, color: "#B45309" },
    DESK: { label: "Mesa de trabalho", icon: LaptopIcon, color: "#0EA5E9" },
    SOFA: { label: "Sofá", icon: SofaIcon, color: "#EC4899" },
    TV: { label: "TV", icon: TvIcon, color: "#6366F1" },
    MONITOR: { label: "Monitor", icon: MonitorIcon, color: "#3B82F6" },
    TREE: { label: "Árvore", icon: TreePineIcon, color: "#16A34A" },
    PLANT: { label: "Planta", icon: LeafIcon, color: "#22C55E" },
    RUG: { label: "Tapete", icon: RectangleHorizontalIcon, color: "#A855F7" },
    POSTER: { label: "Pôster", icon: ImageIcon, color: "#F43F5E" },
    DOOR: { label: "Porta", icon: DoorOpenIcon, color: "#92400E" },
    WINDOW: { label: "Janela", icon: AppWindowIcon, color: "#06B6D4" },
    DECORATION: { label: "Decoração", icon: SparklesIcon, color: "#EAB308" },
};
