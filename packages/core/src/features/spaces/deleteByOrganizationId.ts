import { spacesTable, eq, and, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";
import { ConversationService } from "../conversations";

export const deleteSpacesByOrganizationId = async (
    organizationId: string,
    tx: Transaction
): Promise<void> => {
    const deletedSpaces = await tx
        .update(spacesTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(spacesTable.organizationId, organizationId),
                isNull(spacesTable.deletedAt)
            )
        )
        .returning({ id: spacesTable.id });

    await ConversationService.deleteBySpaceIds(
        deletedSpaces.map(({ id }) => id),
        tx
    );
};
