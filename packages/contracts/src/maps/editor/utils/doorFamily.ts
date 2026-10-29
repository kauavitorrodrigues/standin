import { ASSET_TYPES } from "../../../assets/enums/asset-type";
import { getFamilyId } from "../../../assets/utils/assetFamily";
import { pickDoorVariantForSide } from "../../../assets/utils/pickDoorVariant";
import { DOOR_SIDES } from "../../../assets/consts/door";
import type { AssetDefinition } from "../../../assets/types";
import type { DoorSide } from "../../layout/findDoorSlots";
import type { DoorSizeBySide } from "../types/door-size-by-side";

const SIDES = Object.values(DOOR_SIDES) as DoorSide[];

/**
 * The variants (rotations and colors) of the family the asset belongs to.
 * Empty when the asset is not in the list or is not a door.
 */
export const getDoorFamily = (
    assets: AssetDefinition[],
    doorAssetId: string
): AssetDefinition[] => {
    const door = assets.find(({ id }) => id === doorAssetId);
    if (door?.type !== ASSET_TYPES.DOOR) return [];

    const familyId = getFamilyId(door);
    return assets.filter((asset) => getFamilyId(asset) === familyId);
};

/**
 * The footprint of the variant that fits each side. A side without an exact
 * variant uses the base one, as the pick says. Null for a family with no
 * variants.
 */
export const getDoorSizeBySide = (
    family: AssetDefinition[]
): DoorSizeBySide | null => {
    const sizes = {} as DoorSizeBySide;

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
