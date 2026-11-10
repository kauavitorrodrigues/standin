import { db } from "@standin/database";
import { IntegrationRepository } from "../repository";

/**
 * For whatever ends a membership: the person keeps no connection to any
 * provider in that organization, and nothing happens when there was none.
 */
export const disconnectMemberFromIntegrations = async (input: {
    organizationId: string;
    userId: string;
}): Promise<void> => {
    await IntegrationRepository.deleteConnectionsOfMember(db, input);
};
