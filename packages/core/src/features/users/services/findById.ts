import { userSelect } from "../consts/select";
import { db, usersTable, eq, and, isNull } from "@standin/database";
import type { User } from "@standin/contracts";

export const findUserById = async (id: string): Promise<User | null> => {
    const [user] = await db
        .select(userSelect)
        .from(usersTable)
        .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)));

    return user ?? null;
};
