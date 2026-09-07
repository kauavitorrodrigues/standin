import { userSelect } from "./consts/select";
import { db, usersTable, eq, and, isNull } from "@standin/database";
import { normalizeEmail } from "@standin/contracts";
import type { User } from "@standin/contracts";

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const [user] = await db
        .select(userSelect)
        .from(usersTable)
        .where(
            and(
                eq(usersTable.email, normalizeEmail(email)),
                isNull(usersTable.deletedAt)
            )
        );

    return user ?? null;
};
