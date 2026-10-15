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
