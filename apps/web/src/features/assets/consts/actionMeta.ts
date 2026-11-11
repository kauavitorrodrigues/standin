import { ArmchairIcon, BanIcon, GlobeIcon } from "lucide-react";
import { ASSET_ACTIONS, OBJECT_BEHAVIORS } from "@standin/contracts";
import type { MetaItem } from "@/types/meta";

// The select cannot hold null, so a piece without action is this value.
export const NO_ACTION = "NONE";

// What a new piece does when used: nothing, an action (sit), or a behavior
// (a website). One of them at most, because they share this select.
export type CreateAssetAction =
    | typeof NO_ACTION
    | typeof ASSET_ACTIONS.SIT
    | typeof OBJECT_BEHAVIORS.EMBEDDED_WEBSITE;

export const ASSET_ACTION_META: Record<CreateAssetAction, MetaItem> = {
    [NO_ACTION]: { label: "Nenhuma", icon: BanIcon, color: "#78716C" },
    [ASSET_ACTIONS.SIT]: {
        label: "Sentar",
        icon: ArmchairIcon,
        color: "#F59E0B",
    },
    [OBJECT_BEHAVIORS.EMBEDDED_WEBSITE]: {
        label: "Site embutido",
        icon: GlobeIcon,
        color: "#0EA5E9",
    },
};
