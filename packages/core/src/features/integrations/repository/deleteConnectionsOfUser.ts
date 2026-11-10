import { appConnectionsTable, eq } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";

/** Every connection of a person, in every organization and provider. */
export const deleteConnectionsOfUser = async (
    executor: DbExecutor,
    userId: string
): Promise<void> => {
    await executor
        .delete(appConnectionsTable)
        .where(eq(appConnectionsTable.userId, userId));
};
