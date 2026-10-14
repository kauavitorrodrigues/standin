import { BaseError } from "../errors/base";

export class UserAlreadyExistsError extends BaseError {
    constructor() {
        super(
            "An account with this email already exists.",
            "USER_ALREADY_EXISTS",
            409
        );
    }
}
