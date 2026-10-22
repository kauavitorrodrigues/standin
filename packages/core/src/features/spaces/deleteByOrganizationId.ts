import { spacesTable, eq, and, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import { ConversationService } from "../conversations";
import { MapService } from "../maps";
import {
    deleteSpaceGuestsBySpaceIds,
    type RemovedGuest,
} from "./guests/deleteBySpaceIds";

export const deleteSpacesByOrganizationId = async (
    organizationId: string,
    tx: Transaction
): Promise<RemovedGuest[]> => {
    const deletedSpaces = await tx
        .update(spacesTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt)
            )
        )
        .returning({ id: spacesTable.id, mapId: spacesTable.mapId });

    await ConversationService.deleteBySpaceIds(
        deletedSpaces.map(({ id }) => id),
        tx
    );
    await MapService.deleteByIds(
        deletedSpaces.map(({ mapId }) => mapId),
        tx
    );
    return deleteSpaceGuestsBySpaceIds(
        deletedSpaces.map(({ id }) => id),
        tx
    );
};
