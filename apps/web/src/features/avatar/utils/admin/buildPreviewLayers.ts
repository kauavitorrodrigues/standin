import type { AvatarLayer, AvatarSlot } from "@standin/contracts";
import { AVATAR_SLOTS } from "@standin/contracts";
import type { SheetPixels } from "../../types/parts";

type Params = {
    slot: AvatarSlot;
    // Null while the base sheet is missing, so the part shows alone.
    base: SheetPixels | null;
    front: SheetPixels;
};

// The stack of a part on the base, from bottom to top: the base and the
// sheet. A costume has no base under it, as in the assembled sheet.
export const buildPreviewLayers = ({
    slot,
    base,
    front,
}: Params): AvatarLayer[] => {
    const layers: AvatarLayer[] = [];

    if (base !== null && slot !== AVATAR_SLOTS.COSTUME) {
        layers.push({ rgba: base });
    }
    layers.push({ rgba: front });
    return layers;
};
