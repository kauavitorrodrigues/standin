import type { Transaction } from "@standin/database";
import { lockOrganizationIntegrations } from "./lock";
import { IntegrationRepository } from "../repository";

/** For the deletion of the organization, inside its transaction. */
export const deleteIntegrationsByOrganizationId = async (
    organizationId: string,
    tx: Transaction
): Promise<void> => {
    await lockOrganizationIntegrations(tx, organizationId);
    await IntegrationRepository.deleteConnectionsOfOrganization(
        tx,
        organizationId
    );
    await IntegrationRepository.deleteIntegrationsOfOrganization(
        tx,
        organizationId
    );
};
