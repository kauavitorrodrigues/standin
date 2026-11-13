import { db } from "@standin/database";
import type { DbExecutor } from "../../../lib/types";
import { IntegrationRepository } from "../repository";

/**
 * For whatever ends a membership: the person keeps no connection to any
 * provider in that organization, and nothing happens when there was none.
 */
export const disconnectMemberFromIntegrations = async (
    input: {
        organizationId: string;
        userId: string;
    },
    // The removal passes its transaction, so no token stays if it fails.
    executor: DbExecutor = db
): Promise<void> => {
    await IntegrationRepository.deleteConnectionsOfMember(executor, input);
};
