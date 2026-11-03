import { organizationInviteLinksTable } from "@standin/database";

export const fixedLinkSelect = {
    id: organizationInviteLinksTable.id,
    organizationId: organizationInviteLinksTable.organizationId,
    tokenEncrypted: organizationInviteLinksTable.tokenEncrypted,
    createdAt: organizationInviteLinksTable.createdAt,
};
