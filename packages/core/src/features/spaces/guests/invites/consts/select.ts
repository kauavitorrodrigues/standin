import { spaceInviteLinksTable } from "@standin/database";

export const linkSelect = {
    id: spaceInviteLinksTable.id,
    spaceId: spaceInviteLinksTable.spaceId,
    createdBy: spaceInviteLinksTable.createdBy,
    expiresAt: spaceInviteLinksTable.expiresAt,
    maxUses: spaceInviteLinksTable.maxUses,
    usesCount: spaceInviteLinksTable.usesCount,
    revokedAt: spaceInviteLinksTable.revokedAt,
    createdAt: spaceInviteLinksTable.createdAt,
};
