import { SpaceService } from "../../spaces";
import { db } from "@standin/database";
import { DeskNotFoundError, MapAssetForbiddenError } from "@standin/contracts";
import type { DeskActor } from "./types/desk-actor";
import type { DeskChange } from "./types/desk-change";
import { findActiveDesk } from "./utils/findActiveDesk";
import { lockDesk } from "./utils/lockDesk";
import { releaseRow } from "./utils/releaseRow";

/**
 * Frees a desk. The owner of the desk frees their own, and the owner of the
 * organization frees anyone's.
 */
export const releaseDesk = async (
    spaceId: string,
    mapAssetId: string,
    actor: DeskActor
): Promise<DeskChange> => {
    const space = await SpaceService.findRefById(spaceId);

    return db.transaction(async (tx) => {
        await lockDesk(tx, space, mapAssetId);

        const desk = await findActiveDesk(tx, { mapAssetId });
        if (!desk) throw new DeskNotFoundError();
        if (desk.userId !== actor.userId && !actor.canManage) {
            throw new MapAssetForbiddenError();
        }

        await releaseRow(tx, desk.id);

        return { spaceId, mapAssetId, userId: desk.userId };
    });
};
