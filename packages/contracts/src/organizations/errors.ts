import { BaseError } from "../errors/base";

export class OrganizationNotFoundError extends BaseError {
    constructor() {
        super("Organização não encontrada.", "ORGANIZATION_NOT_FOUND", 404);
    }
}

export class OrganizationAccessDeniedError extends BaseError {
    constructor() {
        super(
            "Você não tem acesso a esta organização.",
            "ORGANIZATION_ACCESS_DENIED",
            403,
        );
    }
}
