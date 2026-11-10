import { organizationIntegrationsTable } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { OrganizationIntegrationKey } from "../types";
import { integrationIs } from "./conditions";

export const deleteIntegration = async (
    executor: DbExecutor,
    key: OrganizationIntegrationKey
): Promise<void> => {
    await executor
        .delete(organizationIntegrationsTable)
        .where(integrationIs(key));
};
