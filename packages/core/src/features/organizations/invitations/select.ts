import { organizationInvitesTable } from "@standin/database";

export const invitationSelect = {
    id: organizationInvitesTable.id,
    organizationId: organizationInvitesTable.organizationId,
    email: organizationInvitesTable.email,
    tokenEncrypted: organizationInvitesTable.tokenEncrypted,
    spaceId: organizationInvitesTable.spaceId,
    mapAssetId: organizationInvitesTable.mapAssetId,
    createdBy: organizationInvitesTable.createdBy,
    expiresAt: organizationInvitesTable.expiresAt,
    acceptedAt: organizationInvitesTable.acceptedAt,
    createdAt: organizationInvitesTable.createdAt,
};
