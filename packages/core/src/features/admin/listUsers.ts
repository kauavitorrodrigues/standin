import { db, usersTable, desc, isNull } from "@standin/database";
import type { AdminUserSummary } from "@standin/contracts";

/** The active people of the instance, newest first. No password, ever. */
export const listAdminUsers = async (): Promise<AdminUserSummary[]> => {
    const rows = await db
        .select({
            id: usersTable.id,
            name: usersTable.name,
            email: usersTable.email,
            role: usersTable.role,
            createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .where(isNull(usersTable.deletedAt))
        .orderBy(desc(usersTable.createdAt));

    return rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
    }));
};
