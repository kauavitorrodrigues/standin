import type {
    SpaceGuest,
    SpaceGuestState,
    SpaceGuestStatus,
    SpaceGuestStatusReason,
} from "@standin/contracts";

// The columns of a guest row the rules read.
export type GuestRow = {
    id: string;
    spaceId: string;
    userId: string;
    status: SpaceGuestStatus;
    statusReason: SpaceGuestStatusReason;
    respondedBy: string | null;
    respondedAt: Date | null;
    // Null: no end, a host sends the guest out.
    expiresAt: Date | null;
    requestedAt: Date;
};

export type GuestRowWithName = GuestRow & {
    name: string;
    // The file of the profile picture, null when the person has none.
    profilePictureFileId: string | null;
};

// A row of the full list of guests: the guest and when it was archived.
export type GuestEntryRow = GuestRowWithName & {
    archivedAt: Date | null;
};

// A page of those rows and how many rows match in all.
export type GuestEntryRowPage = {
    rows: GuestEntryRow[];
    total: number;
};

// A guest who may be in the space right now.
export type AdmittedGuest = {
    id: string;
    spaceId: string;
    userId: string;
    expiresAt: Date | null;
};

// What the sockets need to tell: someone asked to enter, the answer reached the
// guest, or the guest lost the access.
export type SpaceGuestEvent =
    | { type: "requested"; guest: SpaceGuest }
    | { type: "status"; userId: string; state: SpaceGuestState }
    | { type: "removed"; spaceId: string; userId: string }
    // The requests of the space changed: the hosts refresh the list they act on.
    | { type: "updated"; spaceId: string };

export type SpaceGuestListener = (
    event: SpaceGuestEvent
) => void | Promise<void>;

// What decides the state a host sees for a guest in the full list.
export type GuestListStateInput = {
    status: SpaceGuestStatus;
    statusReason: SpaceGuestStatusReason;
    archivedAt: Date | null;
};
