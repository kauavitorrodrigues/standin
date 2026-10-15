import { SpaceService } from "../../spaces";
import { db, deskAssignmentsTable } from "@standin/database";
import { DeskAlreadyClaimedError } from "@standin/contracts";
import type { DeskSwap } from "./types/desk-change";
import { assertActiveMember } from "./utils/assertActiveMember";
import { findActiveDesk } from "./utils/findActiveDesk";
import { lockDesk } from "./utils/lockDesk";
import { releaseRow } from "./utils/releaseRow";
import { translateDeskConflict } from "./utils/translateDeskConflict";

/**
 * The organization owner gives a free desk to a member, freeing the member's
 * previous desk first.
 */
export const assignDesk = async (
    spaceId: string,
    mapAssetId: string,
    targetUserId: string,
    assignedBy: string
): Promise<DeskSwap> => {
    const space = await SpaceService.findRefById(spaceId);
    await assertActiveMember(targetUserId, space.organizationId);

    try {
        return await db.transaction(async (tx) => {
            await lockDesk(tx, space, mapAssetId);

            if (await findActiveDesk(tx, { mapAssetId })) {
                throw new DeskAlreadyClaimedError();
            }

            const previous = await findActiveDesk(tx, {
                spaceId,
                userId: targetUserId,
            });
            if (previous) await releaseRow(tx, previous.id);

            await tx.insert(deskAssignmentsTable).values({
                spaceId,
                mapAssetId,
                userId: targetUserId,
                assignedBy,
            });

            return {
                spaceId,
                mapAssetId,
                userId: targetUserId,
                releasedMapAssetId: previous?.mapAssetId ?? null,
            };
        });
    } catch (error) {
        return translateDeskConflict(error);
    }
};
