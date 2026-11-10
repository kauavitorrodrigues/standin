import { appConnectionsTable, and, eq } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { OrganizationIntegrationKey } from "../types";

/** Every connection made with the app of a provider in the organization. */
export const deleteConnectionsOfIntegration = async (
    executor: DbExecutor,
    { organizationId, provider }: OrganizationIntegrationKey
): Promise<void> => {
    await executor
        .delete(appConnectionsTable)
        .where(
            and(
                eq(appConnectionsTable.organizationId, organizationId),
                eq(appConnectionsTable.provider, provider)
            )
        );
};
