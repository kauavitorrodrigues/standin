import { BaseError } from "./base";

export class MissingEnvError extends BaseError {
    constructor(names: string | string[]) {
        const list = Array.isArray(names) ? names.join(", ") : names;
        super(
            `Missing environment variable(s): ${list}`,
            "MISSING_ENV_VARIABLE",
            500,
        );
    }
}
