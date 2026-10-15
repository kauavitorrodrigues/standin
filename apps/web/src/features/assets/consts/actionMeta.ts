import { ArmchairIcon, BanIcon } from "lucide-react";
import { ASSET_ACTIONS } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";

// The select cannot hold null, so a piece without action is this value.
export const NO_ACTION = "NONE";

export type CreateAssetAction = typeof NO_ACTION | typeof ASSET_ACTIONS.SIT;

export const ASSET_ACTION_META: Record<CreateAssetAction, MetaItem> = {
    [NO_ACTION]: { label: "Nenhuma", icon: BanIcon, color: "#78716C" },
    [ASSET_ACTIONS.SIT]: {
        label: "Sentar",
        icon: ArmchairIcon,
        color: "#F59E0B",
    },
};
