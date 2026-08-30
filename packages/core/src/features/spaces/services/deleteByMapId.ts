import { spacesTable, eq, and, isNull } from "@standin/database";
import type { Transaction } from "@standin/database";

export const deleteSpacesByMapId = async (
    mapId: string,
    tx: Transaction,
): Promise<void> => {
    await tx
        .update(spacesTable)
        .set({ deletedAt: new Date() })
        .where(and(eq(spacesTable.mapId, mapId), isNull(spacesTable.deletedAt)));
};
