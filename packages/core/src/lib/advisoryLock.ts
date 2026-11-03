import { sql } from "@standin/database";
import type { DbExecutor } from "./types";

/**
 * Makes whoever asks for the same key wait for the transaction that holds it,
 * with no row to lock (the thing guarded may not exist yet). Released when the
 * transaction ends.
 */
export const lockByKey = async (
    executor: DbExecutor,
    key: string
): Promise<void> => {
    await executor.execute(sql`select pg_advisory_xact_lock(hashtext(${key}))`);
};
