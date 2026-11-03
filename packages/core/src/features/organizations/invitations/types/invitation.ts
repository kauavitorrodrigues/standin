import type { findInvitationContext } from "../find";

// The columns of an invitation the serializer reads.
export type InvitationRow = {
    id: string;
    organizationId: string;
    email: string;
    // Null reads as a token this server cannot open.
    tokenEncrypted: string | null;
    spaceId: string | null;
    mapAssetId: string | null;
    createdBy: string | null;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
};

// An open invitation with its organization and who made it.
export type InvitationContext = Awaited<
    ReturnType<typeof findInvitationContext>
>;

// The person's account, as far as an invitation is concerned.
export type InvitedAccount = {
    email: string;
};

// The desk an invitation keeps, when it keeps one.
export type KeptDesk = {
    spaceId: string;
    mapAssetId: string;
};
