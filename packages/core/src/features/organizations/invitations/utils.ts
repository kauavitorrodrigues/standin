import {
    DeskAlreadyClaimedError,
    DeskNotFoundError,
    SpaceNotFoundError,
    normalizeEmail,
} from "@standin/contracts";
import type { OrganizationInvitation } from "@standin/contracts";
import { readSealedToken } from "../../../lib/crypto";
import type {
    InvitationContext,
    InvitationRow,
    InvitedAccount,
    KeptDesk,
} from "./types";

/** True when the e-mail of the account is the one the invitation was made for. */
export const isInvitedEmail = (
    account: InvitedAccount | undefined,
    invitation: Pick<InvitationContext, "email">
): boolean => {
    if (!account) return false;
    return normalizeEmail(account.email) === invitation.email;
};

/** True when the invitation reserves a desk of a space for the person. */
export const hasKeptDesk = (
    invitation: Pick<InvitationContext, "spaceId" | "mapAssetId">
): invitation is Pick<InvitationContext, "spaceId" | "mapAssetId"> & KeptDesk =>
    !!invitation.spaceId && !!invitation.mapAssetId;

/**
 * The reasons a kept desk cannot be given when the person joins: someone took
 * it, or the desk or the space is gone. The person joins anyway, without it.
 */
export const isDeskUnavailableError = (error: unknown): boolean =>
    error instanceof DeskAlreadyClaimedError ||
    error instanceof DeskNotFoundError ||
    error instanceof SpaceNotFoundError;

/**
 * The invitation as the owner sees it, with the link to copy. Null when the
 * token cannot be opened (the server secret changed): there is no link to show.
 */
export const serializeInvitation = (
    row: InvitationRow
): OrganizationInvitation | null => {
    const token = readSealedToken(row);
    if (!token) return null;

    return {
        id: row.id,
        organizationId: row.organizationId,
        email: row.email,
        spaceId: row.spaceId,
        mapAssetId: row.mapAssetId,
        createdBy: row.createdBy,
        expiresAt: row.expiresAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
        token,
    };
};

/** The invitations that have a link to show. */
export const serializeInvitations = (
    rows: InvitationRow[]
): OrganizationInvitation[] =>
    rows.flatMap((row) => {
        const invitation = serializeInvitation(row);
        return invitation ? [invitation] : [];
    });
