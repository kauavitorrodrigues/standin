import { db, eq, serviceTokensTable } from "@standin/database";

export const touchServiceTokenLastUsed = async (
    id: string,
    lastUsedAt: Date
): Promise<void> => {
    await db
        .update(serviceTokensTable)
        .set({ lastUsedAt })
        .where(eq(serviceTokensTable.id, id));
};
