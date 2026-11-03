import { spaceInviteLinksTable } from "@standin/database";

export const fixedLinkSelect = {
    id: spaceInviteLinksTable.id,
    spaceId: spaceInviteLinksTable.spaceId,
    tokenEncrypted: spaceInviteLinksTable.tokenEncrypted,
    guestValidityHours: spaceInviteLinksTable.guestValidityHours,
    createdAt: spaceInviteLinksTable.createdAt,
};
