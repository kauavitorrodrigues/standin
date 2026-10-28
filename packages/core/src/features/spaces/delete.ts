import { spaceSelect } from "./consts/select";
import { db, spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type { Space } from "@standin/contracts";
import { serializeSpaceWithoutThumbnail } from "./utils/serializeReturnedSpace";
import { ConversationService } from "../conversations";
import { FileService } from "../files";
import { MapService } from "../maps";
import {
    deleteSpaceGuestsBySpaceIds,
    publishGuestsRemoved,
} from "./guests/deleteBySpaceIds";

export const deleteSpace = async (
    organizationId: string,
    id: string
): Promise<Space> => {
    const { space, removedGuests, storageKeys } = await db.transaction(
        async (tx) => {
            const [space] = await tx
                .update(spacesTable)
                .set({ deletedAt: new Date() })
                .where(
                    and(
                        eq(spacesTable.id, id),
                        eq(spacesTable.organizationId, organizationId),
                        isNull(spacesTable.deletedAt)
                    )
                )
                .returning(spaceSelect);

            if (!space) throw new SpaceNotFoundError();

            await ConversationService.deleteBySpaceIds([space.id], tx);

            await MapService.deleteByIds([space.mapId], tx);

            const removedGuests = await deleteSpaceGuestsBySpaceIds(
                [space.id],
                tx
            );

            // The object leaves storage only after the commit, so a rollback
            // never loses a photo a live space still shows.
            const storageKeys = await FileService.softDeleteManyByIds(
                space.thumbnailFileId ? [space.thumbnailFileId] : [],
                tx
            );

            return { space, removedGuests, storageKeys };
        }
    );

    await FileService.purge(storageKeys);

    // The guests inside lose their sockets once the deletion is committed.
    await publishGuestsRemoved(removedGuests);

    // The file of the thumbnail went with the space.
    return serializeSpaceWithoutThumbnail(space);
};
