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

// The person is not in a space, so there is nobody to tell.
export class ActiveObjectNotAllowedError extends BaseError {
    constructor() {
        super(
            "You cannot open an object in this space.",
            "ACTIVE_OBJECT_NOT_ALLOWED",
            403
        );
    }
}

// The request is malformed, or the object is not a website of this space.
export class ActiveObjectInvalidError extends BaseError {
    constructor() {
        super("The object cannot be opened.", "ACTIVE_OBJECT_INVALID", 422);
    }
}

// Guests see the object but do not decide for the others, and nobody who is
// not looking at the object can close it for the ones who are.
export class CloseObjectForViewersNotAllowedError extends BaseError {
    constructor() {
        super(
            "You cannot close this object for the people viewing it.",
            "CLOSE_OBJECT_FOR_VIEWERS_NOT_ALLOWED",
            403
        );
    }
}

export class CloseObjectForViewersInvalidError extends BaseError {
    constructor() {
        super(
            "The close request is invalid.",
            "CLOSE_OBJECT_FOR_VIEWERS_INVALID",
            422
        );
    }
}
