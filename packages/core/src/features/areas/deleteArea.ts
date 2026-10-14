import { db, areasTable, eq } from "@standin/database";
import { findScopedArea } from "./utils/findArea";

/** Soft deletes an area. Maps that placed it keep their copy. */
export const deleteArea = async (
    id: string,
    organizationId: string | null
): Promise<void> => {
    await findScopedArea(id, organizationId);
    const now = new Date();
    await db
        .update(areasTable)
        .set({ deletedAt: now, updatedAt: now })
        .where(eq(areasTable.id, id));
};
