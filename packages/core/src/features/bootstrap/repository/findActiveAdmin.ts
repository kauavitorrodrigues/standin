import { db, usersTable, and, eq, isNull } from "@standin/database";
import { USER_ROLES } from "@standin/contracts";

export const findActiveAdmin = async () => {
    const [admin] = await db
        .select({ id: usersTable.id, email: usersTable.email })
        .from(usersTable)
        .where(
            and(
                eq(usersTable.role, USER_ROLES.ADMIN),
                isNull(usersTable.deletedAt)
            )
        )
        .limit(1);
    return admin ?? null;
};
