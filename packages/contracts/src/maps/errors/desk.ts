import { BaseError } from "../../errors/base";

export class DeskNotFoundError extends BaseError {
    constructor() {
        super("Desk not found.", "DESK_NOT_FOUND", 404);
    }
}

export class DeskAlreadyClaimedError extends BaseError {
    constructor() {
        super("This desk already has an owner.", "DESK_ALREADY_CLAIMED", 409);
    }
}

export class UserAlreadyHasDeskError extends BaseError {
    constructor() {
        super(
            "You already have a desk in this space. Release it before claiming another.",
            "USER_ALREADY_HAS_DESK",
            409
        );
    }
}

export class DeskClaimedError extends BaseError {
    constructor() {
        super(
            "This desk has an owner. Confirm the release to delete it.",
            "DESK_CLAIMED",
            409
        );
    }
}

export class DeskUserNotMemberError extends BaseError {
    constructor() {
        super(
            "The person must be a member of the space organization.",
            "DESK_USER_NOT_MEMBER",
            422
        );
    }
}
