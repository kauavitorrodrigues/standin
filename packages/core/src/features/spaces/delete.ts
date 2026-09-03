import { spaceSelect } from "./consts/select";
import { db, spacesTable, eq, and, isNull } from "@standin/database";
import { SpaceNotFoundError } from "@standin/contracts";
import type { Space } from "@standin/contracts";
import { ConversationService } from "../conversations";

export const deleteSpace = async (
    organizationId: string,
    id: string
): Promise<Space> => {
    return db.transaction(async (tx) => {
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

        return space;
    });
};
