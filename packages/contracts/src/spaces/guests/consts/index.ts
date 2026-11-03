export const SPACE_GUEST_STATUSES = {
    PENDING: "PENDING",
    ADMITTED: "ADMITTED",
    DENIED: "DENIED",
} as const;

export type SpaceGuestStatus =
    (typeof SPACE_GUEST_STATUSES)[keyof typeof SPACE_GUEST_STATUSES];

export const SPACE_GUEST_STATUS_REASONS = {
    AWAITING_RESPONSE: "AWAITING_RESPONSE",
    HOST_ADMITTED: "HOST_ADMITTED",
    HOST_DENIED: "HOST_DENIED",
    KICKED: "KICKED",
    GUEST_ACCESS_DISABLED: "GUEST_ACCESS_DISABLED",
    TIMEOUT: "TIMEOUT",
} as const;

export type SpaceGuestStatusReason =
    (typeof SPACE_GUEST_STATUS_REASONS)[keyof typeof SPACE_GUEST_STATUS_REASONS];

export const SPACE_GUEST_ACCESS = {
    ALLOWED: "ALLOWED",
    DISABLED: "DISABLED",
} as const;

export type SpaceGuestAccess =
    (typeof SPACE_GUEST_ACCESS)[keyof typeof SPACE_GUEST_ACCESS];

export const SPACE_VIEWER_KINDS = {
    MEMBER: "MEMBER",
    GUEST: "GUEST",
} as const;

export type SpaceViewerKind =
    (typeof SPACE_VIEWER_KINDS)[keyof typeof SPACE_VIEWER_KINDS];

// A pending request waits this long for a host. An admitted guest has no end
// by default; a link may set a validity from the options below.
export const SPACE_GUEST_WINDOW_HOURS = 24;

export const GUEST_VALIDITY_OPTIONS_HOURS = [24, 24 * 7, 24 * 30] as const;

// A fixed link has no end in practice: the owner closes it by resetting it.
export const FIXED_INVITE_LINK_LIFETIME_DAYS = 365 * 10;

// What the hosts see of a guest in the full list.
export const SPACE_GUEST_LIST_STATES = {
    PENDING: "PENDING",
    ACTIVE: "ACTIVE",
    EXPIRED: "EXPIRED",
    REVOKED: "REVOKED",
    ARCHIVED: "ARCHIVED",
} as const;

export type SpaceGuestListState =
    (typeof SPACE_GUEST_LIST_STATES)[keyof typeof SPACE_GUEST_LIST_STATES];

export const SPACE_GUEST_SWEEP_INTERVAL_MS = 60 * 1000;

// A guest holds relay credentials for less time than a member, so a guest who
// was sent out does not keep a relay open for long. The web refetches them
// well before this runs out.
export const GUEST_ICE_TTL_SECONDS = 20 * 60;

// How many closed requests (denied, kicked, lapsed) the hosts see.
export const MAX_CLOSED_GUESTS = 50;
