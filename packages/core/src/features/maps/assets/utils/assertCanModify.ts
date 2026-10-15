import { ASSET_PLACEMENTS, MapAssetForbiddenError } from "@standin/contracts";
import type { Transaction } from "@standin/database";
import type { MapAccess } from "../../types/map-access";
import type { ModifyTarget } from "../types/modify-target";
import { findDeskOwner } from "./findDeskOwner";

/**
 * Who may change an object. The owner of the map edits anything. A member
 * only edits SURFACE items on a desk they claimed, which is checked on every
 * desk the operation touches (origin and destination).
 */
export const assertCanModify = async (
    tx: Transaction,
    access: MapAccess,
    userId: string,
    target: ModifyTarget
) => {
    if (access.canEdit) return;

    if (target.placement === ASSET_PLACEMENTS.SURFACE && target.parentRowId) {
        const desk = await findDeskOwner(tx, target.parentRowId);
        if (desk?.userId === userId) return;
    }

    throw new MapAssetForbiddenError();
};
