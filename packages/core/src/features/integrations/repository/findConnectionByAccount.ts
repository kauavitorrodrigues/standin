import { db, appConnectionsTable, and, eq } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { AppConnectionRow, ConnectionTarget } from "../types";
import { connectionTargetIs } from "./conditions";

/** The connection of the target that holds this account at the provider. */
export const findConnectionByAccount = async (
    target: ConnectionTarget,
    accountId: string,
    executor: DbExecutor = db
): Promise<AppConnectionRow | null> => {
    const [row] = await executor
        .select()
        .from(appConnectionsTable)
        .where(
            and(
                connectionTargetIs(target),
                eq(appConnectionsTable.accountId, accountId)
            )
        )
        .limit(1);

    return row ?? null;
};
