import { BaseError } from "../errors/base";

export class SignupClosedError extends BaseError {
    constructor() {
        super(
            "Sign up is closed on this instance. Ask an admin for an invite link.",
            "SIGNUP_CLOSED",
            403
        );
    }
}

export class OrganizationCreationBlockedError extends BaseError {
    constructor() {
        super(
            "Creating organizations is blocked on this instance.",
            "ORGANIZATION_CREATION_BLOCKED",
            403
        );
    }
}

export class SpaceCreationBlockedError extends BaseError {
    constructor() {
        super(
            "Creating spaces is blocked on this instance.",
            "SPACE_CREATION_BLOCKED",
            403
        );
    }
}
