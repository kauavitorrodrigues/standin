import { BaseError } from "../errors/base";

export class OrganizationNotFoundError extends BaseError {
    constructor() {
        super("Organization not found.", "ORGANIZATION_NOT_FOUND", 404);
    }
}

export class OrganizationAccessDeniedError extends BaseError {
    constructor() {
        super(
            "You do not have access to this organization.",
            "ORGANIZATION_ACCESS_DENIED",
            403
        );
    }
}

export class OrganizationInvitationNotFoundError extends BaseError {
    constructor() {
        super(
            "Invitation not found.",
            "ORGANIZATION_INVITATION_NOT_FOUND",
            404
        );
    }
}

export class OrganizationInvitationExpiredError extends BaseError {
    constructor() {
        super(
            "This invitation has expired.",
            "ORGANIZATION_INVITATION_EXPIRED",
            410
        );
    }
}

export class OrganizationInvitationEmailMismatchError extends BaseError {
    constructor() {
        super(
            "This invitation is for another e-mail.",
            "ORGANIZATION_INVITATION_EMAIL_MISMATCH",
            403
        );
    }
}

export class OrganizationInvitationDeskUnavailableError extends BaseError {
    constructor() {
        super(
            "This desk is not free to keep for an invitation.",
            "ORGANIZATION_INVITATION_DESK_UNAVAILABLE",
            409
        );
    }
}

export class OrganizationOwnerOnlyError extends BaseError {
    constructor() {
        super(
            "Only the owner of the organization can do this.",
            "ORGANIZATION_OWNER_ONLY",
            403
        );
    }
}
