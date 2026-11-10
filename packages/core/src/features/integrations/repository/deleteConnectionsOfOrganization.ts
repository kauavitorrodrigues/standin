import { appConnectionsTable, eq } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";

export const deleteConnectionsOfOrganization = async (
    executor: DbExecutor,
    organizationId: string
): Promise<void> => {
    await executor
        .delete(appConnectionsTable)
        .where(eq(appConnectionsTable.organizationId, organizationId));
};
