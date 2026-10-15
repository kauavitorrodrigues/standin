import {
    MapAssetClaimedDeskModelError,
    MapAssetModelMismatchError,
} from "@standin/contracts";
import type { Transaction } from "@standin/database";
import type { AssetDef } from "../types/asset-def";
import type { Item } from "../types/item";
import { findDeskOwner } from "./findDeskOwner";

/**
 * A model swap keeps the placement kind, and a claimed desk can only become
 * another desk.
 */
export const assertReplaceable = async (
    tx: Transaction,
    current: Item,
    nextAsset: AssetDef
) => {
    if (nextAsset.placement !== current.placement) {
        throw new MapAssetModelMismatchError();
    }

    const claimed = await findDeskOwner(tx, current.rowId);
    if (claimed && nextAsset.type !== current.type) {
        throw new MapAssetClaimedDeskModelError();
    }
};
