import { db, appConnectionsTable, count } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { ConnectionTarget } from "../types";
import { connectionTargetIs } from "./conditions";

export const countConnections = async (
    target: ConnectionTarget,
    executor: DbExecutor = db
): Promise<number> => {
    const [row] = await executor
        .select({ total: count() })
        .from(appConnectionsTable)
        .where(connectionTargetIs(target));

    return row?.total ?? 0;
};
