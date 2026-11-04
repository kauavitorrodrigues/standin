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
