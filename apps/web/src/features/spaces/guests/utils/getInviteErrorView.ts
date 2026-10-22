import axios from "axios";

export const INVITE_ERROR_VIEWS = {
    NOT_FOUND: "not-found",
    EXPIRED: "expired",
    REVOKED: "revoked",
    EXHAUSTED: "exhausted",
    DISABLED: "disabled",
    TOO_MANY: "too-many",
    UNKNOWN: "unknown",
} as const;

export type InviteErrorView =
    (typeof INVITE_ERROR_VIEWS)[keyof typeof INVITE_ERROR_VIEWS];

const TOO_MANY_REQUESTS = 429;

const getErrorCode = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) return null;

    const code = error.response?.data?.code;
    if (typeof code !== "string") return null;

    return code;
};

/** Which error screen an invite that could not be opened or asked calls for. */
export const getInviteErrorView = (error: unknown): InviteErrorView => {
    if (
        axios.isAxiosError(error) &&
        error.response?.status === TOO_MANY_REQUESTS
    ) {
        return INVITE_ERROR_VIEWS.TOO_MANY;
    }

    switch (getErrorCode(error)) {
        case "INVITE_LINK_NOT_FOUND":
            return INVITE_ERROR_VIEWS.NOT_FOUND;
        case "INVITE_LINK_EXPIRED":
            return INVITE_ERROR_VIEWS.EXPIRED;
        case "INVITE_LINK_REVOKED":
            return INVITE_ERROR_VIEWS.REVOKED;
        case "INVITE_LINK_EXHAUSTED":
            return INVITE_ERROR_VIEWS.EXHAUSTED;
        case "GUEST_ACCESS_DISABLED":
            return INVITE_ERROR_VIEWS.DISABLED;
        default:
            return INVITE_ERROR_VIEWS.UNKNOWN;
    }
};
