import { db, organizationsTable, isNull } from "@standin/database";

export const findFirstOrganization = async () => {
    const [organization] = await db
        .select({ id: organizationsTable.id, name: organizationsTable.name })
        .from(organizationsTable)
        .where(isNull(organizationsTable.deletedAt))
        .limit(1);
    return organization ?? null;
};
