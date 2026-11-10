import { organizationIntegrationsTable } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import type { UpsertOrganizationIntegrationInput } from "../types";

/** One app per provider: a second save replaces the first. */
export const upsertIntegration = async (
    executor: DbExecutor,
    input: UpsertOrganizationIntegrationInput
): Promise<void> => {
    await executor
        .insert(organizationIntegrationsTable)
        .values(input)
        .onConflictDoUpdate({
            target: [
                organizationIntegrationsTable.organizationId,
                organizationIntegrationsTable.provider,
            ],
            set: {
                updatedById: input.updatedById,
                clientId: input.clientId,
                clientSecretSealed: input.clientSecretSealed,
            },
        });
};
