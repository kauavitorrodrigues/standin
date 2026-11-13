import { usersTable, eq } from "@standin/database";
import type { DbExecutor } from "../../../../lib/types";

/** The e-mail of an account, or null when there is none. */
export const findUserEmail = async (
    executor: DbExecutor,
    userId: string
): Promise<string | null> => {
    const [row] = await executor
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, userId));
    return row?.email ?? null;
};
