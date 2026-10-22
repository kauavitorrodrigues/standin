import type { SpaceInviteLink } from "@standin/contracts";

type LinkRow = {
    id: string;
    spaceId: string;
    createdBy: string | null;
    expiresAt: Date;
    maxUses: number | null;
    usesCount: number;
    revokedAt: Date | null;
    createdAt: Date;
};

export const serializeLink = (link: LinkRow): SpaceInviteLink => ({
    id: link.id,
    spaceId: link.spaceId,
    createdBy: link.createdBy,
    expiresAt: link.expiresAt.toISOString(),
    maxUses: link.maxUses,
    usesCount: link.usesCount,
    revokedAt: link.revokedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
});
