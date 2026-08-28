import { BaseError } from "../errors/base";

export class UserAlreadyExistsError extends BaseError {
    constructor() {
        super(
            "Já existe uma conta com este e-mail.",
            "USER_ALREADY_EXISTS",
            409,
        );
    }
}
