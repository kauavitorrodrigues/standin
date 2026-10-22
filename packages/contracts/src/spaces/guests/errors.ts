import { BaseError } from "../../errors/base";

export class InviteLinkNotFoundError extends BaseError {
    constructor() {
        super("Invite link not found.", "INVITE_LINK_NOT_FOUND", 404);
    }
}

export class InviteLinkExpiredError extends BaseError {
    constructor() {
        super("This invite link has expired.", "INVITE_LINK_EXPIRED", 410);
    }
}

export class InviteLinkRevokedError extends BaseError {
    constructor() {
        super("This invite link was revoked.", "INVITE_LINK_REVOKED", 410);
    }
}

export class InviteLinkExhaustedError extends BaseError {
    constructor() {
        super(
            "This invite link has no uses left.",
            "INVITE_LINK_EXHAUSTED",
            410
        );
    }
}

export class GuestAccessDisabledError extends BaseError {
    constructor() {
        super(
            "Guest access is disabled for this space.",
            "GUEST_ACCESS_DISABLED",
            403
        );
    }
}

export class SpaceGuestNotFoundError extends BaseError {
    constructor() {
        super("Guest not found.", "SPACE_GUEST_NOT_FOUND", 404);
    }
}

export class SpaceGuestNotPendingError extends BaseError {
    constructor() {
        super(
            "This request was already answered.",
            "SPACE_GUEST_NOT_PENDING",
            409
        );
    }
}

export class SpaceGuestRequestExpiredError extends BaseError {
    constructor() {
        super("This request has expired.", "SPACE_GUEST_REQUEST_EXPIRED", 409);
    }
}

export class SpaceGuestNotAdmittedError extends BaseError {
    constructor() {
        super(
            "This guest is not in the space.",
            "SPACE_GUEST_NOT_ADMITTED",
            409
        );
    }
}

export class SpaceGuestNotReopenableError extends BaseError {
    constructor() {
        super(
            "Only a denied or expired request can be reopened.",
            "SPACE_GUEST_NOT_REOPENABLE",
            409
        );
    }
}
