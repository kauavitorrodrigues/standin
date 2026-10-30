import { db, eq, serviceTokensTable } from "@standin/database";

// True when a row was there and is gone.
export const removeServiceToken = async (id: string): Promise<boolean> => {
    const rows = await db
        .delete(serviceTokensTable)
        .where(eq(serviceTokensTable.id, id))
        .returning({ id: serviceTokensTable.id });
    return rows.length > 0;
};
