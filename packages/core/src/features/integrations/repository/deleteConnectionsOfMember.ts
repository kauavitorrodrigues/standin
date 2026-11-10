import { appConnectionsTable, and, eq } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";

/** Every connection a person had in an organization, whatever the provider. */
export const deleteConnectionsOfMember = async (
    executor: DbExecutor,
    { organizationId, userId }: { organizationId: string; userId: string }
): Promise<void> => {
    await executor
        .delete(appConnectionsTable)
        .where(
            and(
                eq(appConnectionsTable.organizationId, organizationId),
                eq(appConnectionsTable.userId, userId)
            )
        );
};
