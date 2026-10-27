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

// A pending request waits this long for a host, and an admitted guest keeps
// the access this long after being admitted (the guest pass window).
export const SPACE_GUEST_WINDOW_HOURS = 24;

export const DEFAULT_INVITE_LINK_EXPIRES_IN_HOURS = 24 * 7;
export const MAX_INVITE_LINK_EXPIRES_IN_HOURS = 24 * 90;
export const MAX_INVITE_LINK_USES = 1000;

export const SPACE_GUEST_SWEEP_INTERVAL_MS = 60 * 1000;

// A guest holds relay credentials for less time than a member, so a guest who
// was sent out does not keep a relay open for long. The web refetches them
// well before this runs out.
export const GUEST_ICE_TTL_SECONDS = 20 * 60;

// How many closed requests (denied, kicked, lapsed) the hosts see.
export const MAX_CLOSED_GUESTS = 50;
