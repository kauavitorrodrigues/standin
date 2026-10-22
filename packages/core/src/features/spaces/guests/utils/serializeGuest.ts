import type { SpaceGuest, SpaceGuestState } from "@standin/contracts";
import { buildFileUrl } from "../../../../lib/buildFileUrl";
import type { GuestRow, GuestRowWithName } from "../types";
import { effectiveState } from "./guestState";

const toProfilePictureUrl = (fileId: string | null): string | null => {
    if (!fileId) return null;
    return buildFileUrl(fileId);
};

export const serializeGuest = (
    row: GuestRowWithName,
    now: Date = new Date()
): SpaceGuest => ({
    id: row.id,
    spaceId: row.spaceId,
    userId: row.userId,
    name: row.name,
    profilePictureUrl: toProfilePictureUrl(row.profilePictureFileId),
    ...effectiveState(row, now),
    respondedBy: row.respondedBy,
    respondedAt: row.respondedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt.toISOString(),
    requestedAt: row.requestedAt.toISOString(),
});

/** Same, for a person who may have never asked. */
export const serializeOptionalGuestState = (
    row: GuestRow | undefined,
    now: Date = new Date()
): SpaceGuestState | null => {
    if (!row) return null;
    return serializeGuestState(row, now);
};

/** What the guest sees of their own request. */
export const serializeGuestState = (
    row: GuestRow,
    now: Date = new Date()
): SpaceGuestState => ({
    id: row.id,
    spaceId: row.spaceId,
    ...effectiveState(row, now),
    respondedAt: row.respondedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt.toISOString(),
});
