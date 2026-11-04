import { and, db, eq, isNull, usersTable } from "@standin/database";

// The raw column of a person who is not deleted. Null when there is none.
export const findOnboardingTasks = async (
    userId: string
): Promise<unknown | null> => {
    const [row] = await db
        .select({ tasks: usersTable.onboardingTasks })
        .from(usersTable)
        .where(and(eq(usersTable.id, userId), isNull(usersTable.deletedAt)));

    return row ? row.tasks : null;
};
