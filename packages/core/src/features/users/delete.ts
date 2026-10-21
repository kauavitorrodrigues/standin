import { db, usersTable, eq } from "@standin/database";
import type { User } from "@standin/contracts";
import { readUser } from "./utils/readUser";

export const deleteUser = async (id: string): Promise<User> => {
    await db
        .update(usersTable)
        .set({ deletedAt: new Date() })
        .where(eq(usersTable.id, id));

    return readUser(id);
};
