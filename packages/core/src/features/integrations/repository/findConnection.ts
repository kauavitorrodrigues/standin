import { db, appConnectionsTable } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { AppConnectionKey, AppConnectionRow } from "../types";
import { connectionIs } from "./conditions";

export const findConnection = async (
    key: AppConnectionKey,
    executor: DbExecutor = db
): Promise<AppConnectionRow | null> => {
    const [row] = await executor
        .select()
        .from(appConnectionsTable)
        .where(connectionIs(key))
        .limit(1);

    return row ?? null;
};
