import { ENV_NAMES } from "../consts/env";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The email given is not the email of an active admin.
export class TokenAdminNotFoundError extends CliError {
    constructor(email: string, emails: string[]) {
        super(
            `${email} is not an active admin.`,
            "CLI_TOKEN_ADMIN_NOT_FOUND",
            400,
            EXIT_CODES.USAGE,
            {
                path: "--admin",
                fix: `Pass --admin <email> (or set ${ENV_NAMES.ADMIN_EMAIL}) with one of: ${emails.join(", ")}.`,
            }
        );
    }
}
