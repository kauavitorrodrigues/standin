import { BaseError } from "../errors/base";

// Raised when space.settings.enableSendNearbyInMapView is false.
export class SendNearbyDisabledError extends BaseError {
    constructor() {
        super(
            "Send nearby messages is disabled for this space.",
            "SEND_NEARBY_DISABLED",
            403
        );
    }
}

export class SpaceNotFoundError extends BaseError {
    constructor() {
        super("Space not found.", "SPACE_NOT_FOUND", 404);
    }
}
