import { deleteIntegrationsByOrganizationId } from "./deleteByOrganizationId";
import { deleteIntegrationsByUserId } from "./deleteByUserId";
import { disconnectMemberFromIntegrations } from "./disconnectMember";
import { lockOrganizationIntegrations } from "./lock";

export const IntegrationService = {
    lock: lockOrganizationIntegrations,
    deleteByOrganizationId: deleteIntegrationsByOrganizationId,
    deleteByUserId: deleteIntegrationsByUserId,
    disconnectMember: disconnectMemberFromIntegrations,
};
