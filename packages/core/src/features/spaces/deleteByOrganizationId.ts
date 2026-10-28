import { spacesTable, eq, and, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import { ConversationService } from "../conversations";
import { FileService } from "../files";
import { MapService } from "../maps";
import {
    deleteSpaceGuestsBySpaceIds,
    type RemovedGuest,
} from "./guests/deleteBySpaceIds";

export type DeletedSpaces = {
    removedGuests: RemovedGuest[];
    // Storage keys of the photos, for the caller to purge once its
    // transaction commits (see `FileService.purge`).
    storageKeys: string[];
};

export const deleteSpacesByOrganizationId = async (
    organizationId: string,
    tx: Transaction
): Promise<DeletedSpaces> => {
    const deletedSpaces = await tx
        .update(spacesTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt)
            )
        )
        .returning({
            id: spacesTable.id,
            mapId: spacesTable.mapId,
            thumbnailFileId: spacesTable.thumbnailFileId,
        });

    await ConversationService.deleteBySpaceIds(
        deletedSpaces.map(({ id }) => id),
        tx
    );

    await MapService.deleteByIds(
        deletedSpaces.map(({ mapId }) => mapId),
        tx
    );

    const storageKeys = await FileService.softDeleteManyByIds(
        deletedSpaces.flatMap(({ thumbnailFileId }) =>
            thumbnailFileId ? [thumbnailFileId] : []
        ),
        tx
    );

    const removedGuests = await deleteSpaceGuestsBySpaceIds(
        deletedSpaces.map(({ id }) => id),
        tx
    );

    return { removedGuests, storageKeys };
};
