import { SpaceService } from "../../spaces";
import { db, deskAssignmentsTable } from "@standin/database";
import {
    DeskAlreadyClaimedError,
    UserAlreadyHasDeskError,
} from "@standin/contracts";
import type { DeskSwap } from "./types/desk-change";
import { assertActiveMember } from "./utils/assertActiveMember";
import { findActiveDesk } from "./utils/findActiveDesk";
import { lockDesk } from "./utils/lockDesk";
import { releaseRow } from "./utils/releaseRow";
import { translateDeskConflict } from "./utils/translateDeskConflict";

/**
 * The person takes a free desk. If they already have one in the space the
 * unique index refuses, unless `swap` frees the old desk in the same
 * transaction.
 */
export const claimDesk = async (
    spaceId: string,
    mapAssetId: string,
    userId: string,
    swap = false
): Promise<DeskSwap> => {
    const space = await SpaceService.findRefById(spaceId);
    await assertActiveMember(userId, space.organizationId);

    try {
        return await db.transaction(async (tx) => {
            await lockDesk(tx, space, mapAssetId);

            if (await findActiveDesk(tx, { mapAssetId })) {
                throw new DeskAlreadyClaimedError();
            }

            const previous = await findActiveDesk(tx, { spaceId, userId });
            if (previous) {
                if (!swap) throw new UserAlreadyHasDeskError();
                await releaseRow(tx, previous.id);
            }

            await tx
                .insert(deskAssignmentsTable)
                .values({ spaceId, mapAssetId, userId });

            return {
                spaceId,
                mapAssetId,
                userId,
                releasedMapAssetId: previous?.mapAssetId ?? null,
            };
        });
    } catch (error) {
        return translateDeskConflict(error);
    }
};
