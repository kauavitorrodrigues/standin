import { spaceSelect } from "./consts/select";
import { db, spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type { Space } from "@standin/contracts";
import { serializeSpace } from "./utils/serializeSpace";
import { ConversationService } from "../conversations";
import { MapService } from "../maps";
import {
    deleteSpaceGuestsBySpaceIds,
    publishGuestsRemoved,
} from "./guests/deleteBySpaceIds";

export const deleteSpace = async (
    organizationId: string,
    id: string
): Promise<Space> => {
    const { space, removedGuests } = await db.transaction(async (tx) => {
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
        const removedGuests = await deleteSpaceGuestsBySpaceIds([space.id], tx);

        return { space, removedGuests };
    });

    // The guests inside lose their sockets once the deletion is committed.
    await publishGuestsRemoved(removedGuests);
    return serializeSpace(space);
};
