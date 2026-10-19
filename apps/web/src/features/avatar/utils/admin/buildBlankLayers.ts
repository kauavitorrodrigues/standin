import type { AvatarLayer, AvatarSlot } from "@standin/contracts";
import { AVATAR_SLOTS } from "@standin/contracts";
import type { SheetPixels } from "../../types/parts";

// The blank avatar alone, shown before a sheet is chosen. A costume has no
// base under it, so for that slot the stage stays empty.
export const buildBlankLayers = (
    slot: AvatarSlot,
    base: SheetPixels | null
): AvatarLayer[] => {
    if (base === null || slot === AVATAR_SLOTS.COSTUME) return [];
    return [{ rgba: base }];
};
