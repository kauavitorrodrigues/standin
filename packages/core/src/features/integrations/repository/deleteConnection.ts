import { appConnectionsTable } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { AppConnectionKey } from "../types";
import { connectionIs } from "./conditions";

/** Whether there was a connection to delete. */
export const deleteConnection = async (
    executor: DbExecutor,
    key: AppConnectionKey
): Promise<boolean> => {
    const deleted = await executor
        .delete(appConnectionsTable)
        .where(connectionIs(key))
        .returning({ id: appConnectionsTable.id });

    return deleted.length > 0;
};
