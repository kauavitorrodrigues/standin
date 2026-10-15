import { ASSET_TYPES, type AssetDefinition } from "@standin/contracts";
import { DOOR_MESSAGES } from "@/features/editor/consts/messages";

// Why the palette cannot offer this asset on this map, or null when it can.
// Only the area composer refuses: there the area decides, and `areaIsRoom`
// says whether it is set to be a room. On a map the door can be picked, and
// the footer explains when it is placed without a room.
export const getDoorPaletteReason = (
    asset: AssetDefinition,
    areaIsRoom?: boolean
): string | null => {
    if (asset.type !== ASSET_TYPES.DOOR) return null;

    switch (areaIsRoom) {
        case false:
            return DOOR_MESSAGES.AREA_NOT_ROOM;
        case true:
        case undefined:
            return null;
    }
};
