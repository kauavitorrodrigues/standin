import { BaseError } from "../errors/base";

export class ServiceTokenNotFoundError extends BaseError {
    constructor() {
        super("Service token not found.", "SERVICE_TOKEN_NOT_FOUND", 404);
    }
}

// The token was revoked by an admin and will never work again.
export class ServiceTokenRevokedError extends BaseError {
    constructor() {
        super(
            "This service token was revoked.",
            "SERVICE_TOKEN_REVOKED",
            401
        );
    }
}

export class ServiceTokenExpiredError extends BaseError {
    constructor() {
        super("This service token has expired.", "SERVICE_TOKEN_EXPIRED", 401);
    }
}

// The token is valid but was not given the scope the route needs.
export class ServiceTokenScopeError extends BaseError {
    constructor(scope: string) {
        super(
            `This service token does not have the "${scope}" scope.`,
            "SERVICE_TOKEN_SCOPE_MISSING",
            403
        );
    }
}
