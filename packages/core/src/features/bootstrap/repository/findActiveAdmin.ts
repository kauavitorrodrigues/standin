import { db, usersTable } from "@standin/database";
import { buildActiveAdminCondition } from "./buildActiveAdminCondition";

export const findActiveAdmin = async () => {
    const [admin] = await db
        .select({ id: usersTable.id, email: usersTable.email })
        .from(usersTable)
        .where(buildActiveAdminCondition())
        .limit(1);
    return admin ?? null;
};
