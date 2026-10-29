import { DOOR_SIDES, pickDoorVariantForSide } from "@standin/contracts";
import type { AssetDefinition, DoorSide } from "@standin/contracts";
import type { TileSize } from "../../types";

const SIDES = Object.values(DOOR_SIDES) as DoorSide[];

// The footprint of the variant that fits each side of a wall. Null when the
// family has no variant at all.
export const getSizeBySide = (
    family: AssetDefinition[]
): Record<DoorSide, TileSize> | null => {
    const sizes = {} as Record<DoorSide, TileSize>;

    for (const side of SIDES) {
        const pick = pickDoorVariantForSide(family, side);
        if (!pick) return null;
        sizes[side] = {
            w: pick.variant.footprint.w,
            h: pick.variant.footprint.h,
        };
    }

    return sizes;
};
