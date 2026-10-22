import {
    SPACE_GUEST_STATUS_REASONS,
    SPACE_GUEST_STATUSES,
    type SpaceGuestState,
} from "@standin/contracts";

export const GUEST_STATUS_VIEWS = {
    WAITING: "waiting",
    ADMITTED: "admitted",
    DENIED: "denied",
    KICKED: "kicked",
    EXPIRED: "expired",
    DISABLED: "disabled",
} as const;

export type GuestStatusView =
    (typeof GUEST_STATUS_VIEWS)[keyof typeof GUEST_STATUS_VIEWS];

const getDeniedView = (state: SpaceGuestState): GuestStatusView => {
    switch (state.statusReason) {
        case SPACE_GUEST_STATUS_REASONS.KICKED:
            return GUEST_STATUS_VIEWS.KICKED;
        case SPACE_GUEST_STATUS_REASONS.TIMEOUT:
            return GUEST_STATUS_VIEWS.EXPIRED;
        case SPACE_GUEST_STATUS_REASONS.GUEST_ACCESS_DISABLED:
            return GUEST_STATUS_VIEWS.DISABLED;
        default:
            return GUEST_STATUS_VIEWS.DENIED;
    }
};

/** Which screen the request of a guest calls for. */
export const getGuestStatusView = (state: SpaceGuestState): GuestStatusView => {
    switch (state.status) {
        case SPACE_GUEST_STATUSES.PENDING:
            return GUEST_STATUS_VIEWS.WAITING;
        case SPACE_GUEST_STATUSES.ADMITTED:
            return GUEST_STATUS_VIEWS.ADMITTED;
        default:
            return getDeniedView(state);
    }
};
