import {
    AssetColorChangeInvalidTargetError,
    getFamilyId,
} from "@standin/contracts";
import type { AssetDef } from "../types/asset-def";
import type { Item } from "../types/item";

/**
 * A color change points the object at a sibling variation: same family
 * (`getFamilyId`) and rotation, with a color that is set and different from
 * the current one. Family rules guarantee the same footprint and behavior
 * inside a rotation, so nothing else is checked here.
 */
export const assertColorChange = (
    current: Item,
    nextAsset: AssetDef | null
) => {
    const isSibling =
        nextAsset !== null &&
        getFamilyId(nextAsset) === getFamilyId(current) &&
        nextAsset.rotation === current.rotation &&
        nextAsset.colorKey !== null &&
        nextAsset.colorKey !== current.colorKey;

    if (!isSibling) throw new AssetColorChangeInvalidTargetError();
};
