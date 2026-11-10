import { db, organizationIntegrationsTable } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type {
    OrganizationIntegrationKey,
    OrganizationIntegrationRow,
} from "../types";
import { integrationIs } from "./conditions";

/** The app an organization brought for a provider, or null when it has none. */
export const findIntegration = async (
    key: OrganizationIntegrationKey,
    executor: DbExecutor = db
): Promise<OrganizationIntegrationRow | null> => {
    const [row] = await executor
        .select({
            clientId: organizationIntegrationsTable.clientId,
            clientSecretSealed:
                organizationIntegrationsTable.clientSecretSealed,
        })
        .from(organizationIntegrationsTable)
        .where(integrationIs(key))
        .limit(1);

    return row ?? null;
};
