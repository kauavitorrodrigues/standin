import { db, sql } from "@standin/database";

// Asks the database for the simplest answer there is. It throws when the
// database cannot be reached.
export const pingDatabase = async (): Promise<void> => {
    await db.execute(sql`select 1`);
};
