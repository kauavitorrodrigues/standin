import { userSelect } from "./consts/select";
import { db, usersTable, eq } from "@standin/database";
import type { User } from "@standin/contracts";

export const deleteUser = async (id: string): Promise<User> => {
    const [user] = await db
        .update(usersTable)
        .set({ deletedAt: new Date() })
        .where(eq(usersTable.id, id))
        .returning(userSelect);

    return user;
};
