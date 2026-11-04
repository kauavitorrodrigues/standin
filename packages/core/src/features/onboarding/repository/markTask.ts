import { and, db, eq, isNull, sql, usersTable } from "@standin/database";

// One statement, so two requests never race: the key is added only while it
// is missing, which keeps the first `completedAt`. Null when nothing changed
// (already marked, or no such person).
export const markOnboardingTask = async (
    userId: string,
    taskKey: string,
    completedAt: Date
): Promise<unknown | null> => {
    const entry = sql`jsonb_build_object('completedAt', ${completedAt.toISOString()}::text)`;

    const [row] = await db
        .update(usersTable)
        .set({
            onboardingTasks: sql`jsonb_set(${usersTable.onboardingTasks}, ARRAY[${taskKey}::text], ${entry})`,
        })
        .where(
            and(
                eq(usersTable.id, userId),
                isNull(usersTable.deletedAt),
                sql`NOT jsonb_exists(${usersTable.onboardingTasks}, ${taskKey}::text)`
            )
        )
        .returning({ tasks: usersTable.onboardingTasks });

    return row ? row.tasks : null;
};
