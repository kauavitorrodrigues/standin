import type {
    OrganizationInviteLink,
    OrganizationInviteLinkRole,
} from "@standin/contracts";

type LinkRow = {
    id: string;
    organizationId: string;
    createdBy: string | null;
    // Stored as text; the schema only ever writes the roles of the contract.
    role: string;
    expiresAt: Date;
    maxUses: number | null;
    usesCount: number;
    revokedAt: Date | null;
    createdAt: Date;
};

export const serializeLink = (link: LinkRow): OrganizationInviteLink => ({
    id: link.id,
    organizationId: link.organizationId,
    createdBy: link.createdBy,
    role: link.role as OrganizationInviteLinkRole,
    expiresAt: link.expiresAt.toISOString(),
    maxUses: link.maxUses,
    usesCount: link.usesCount,
    revokedAt: link.revokedAt?.toISOString() ?? null,
    createdAt: link.createdAt.toISOString(),
});
