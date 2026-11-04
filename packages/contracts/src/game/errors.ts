import { BaseError } from "../errors/base";

export class SocketNotInitializedError extends BaseError {
    constructor() {
        super(
            "Socket.IO has not been initialized yet.",
            "SOCKET_NOT_INITIALIZED",
            500
        );
    }
}

// Reserved for a future phase that surfaces join/signal failures back to
// the client; today the socket handlers just drop unauthorized events.
export class SpaceNotJoinedError extends BaseError {
    constructor() {
        super(
            "You must join the space before continuing.",
            "SPACE_NOT_JOINED",
            400
        );
    }
}

// Sent to a socket right before the server force-disconnects it because the
// same account just joined the same space from another connection.
export class DuplicateSessionError extends BaseError {
    constructor() {
        super(
            "You joined this space from another tab or device. This connection was closed.",
            "SPACE_DUPLICATE_SESSION",
            409
        );
    }
}

// Guests are not members, and announcing is for members.
export class AnnouncingNotAllowedError extends BaseError {
    constructor() {
        super(
            "You cannot announce in this space.",
            "ANNOUNCING_NOT_ALLOWED",
            403
        );
    }
}

export class AnnouncingInvalidError extends BaseError {
    constructor() {
        super("The announcing request is invalid.", "ANNOUNCING_INVALID", 422);
    }
}

// Guests are not members, and sharing video is for members.
export class ShareVideoNotAllowedError extends BaseError {
    constructor() {
        super(
            "You cannot share your video with an announcer in this space.",
            "SHARE_VIDEO_NOT_ALLOWED",
            403
        );
    }
}

export class ShareVideoInvalidError extends BaseError {
    constructor() {
        super(
            "The video sharing request is invalid.",
            "SHARE_VIDEO_INVALID",
            422
        );
    }
}

// There is nobody announcing within earshot to share with.
export class ShareVideoNoAnnouncerError extends BaseError {
    constructor() {
        super(
            "Nobody is announcing near you.",
            "SHARE_VIDEO_NO_ANNOUNCER",
            409
        );
    }
}

// Guests are not members, and raising a hand is for members.
export class HandRaiseNotAllowedError extends BaseError {
    constructor() {
        super(
            "You cannot raise a hand in this space.",
            "HAND_RAISE_NOT_ALLOWED",
            403
        );
    }
}

export class HandRaiseInvalidError extends BaseError {
    constructor() {
        super("The hand raise request is invalid.", "HAND_RAISE_INVALID", 422);
    }
}
