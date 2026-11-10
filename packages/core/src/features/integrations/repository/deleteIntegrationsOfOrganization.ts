import { organizationIntegrationsTable, eq } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";

/** Every app of the organization, whatever the provider. */
export const deleteIntegrationsOfOrganization = async (
    executor: DbExecutor,
    organizationId: string
): Promise<void> => {
    await executor
        .delete(organizationIntegrationsTable)
        .where(
            eq(organizationIntegrationsTable.organizationId, organizationId)
        );
};
