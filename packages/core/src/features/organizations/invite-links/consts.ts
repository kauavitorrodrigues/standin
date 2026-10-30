import { organizationInviteLinksTable } from "@standin/database";

export const linkSelect = {
    id: organizationInviteLinksTable.id,
    organizationId: organizationInviteLinksTable.organizationId,
    createdBy: organizationInviteLinksTable.createdBy,
    role: organizationInviteLinksTable.role,
    expiresAt: organizationInviteLinksTable.expiresAt,
    maxUses: organizationInviteLinksTable.maxUses,
    usesCount: organizationInviteLinksTable.usesCount,
    revokedAt: organizationInviteLinksTable.revokedAt,
    createdAt: organizationInviteLinksTable.createdAt,
};
