import { ENV_NAMES } from "../consts/env";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// Several admins could own the token and none was chosen.
export class TokenAdminAmbiguousError extends CliError {
    constructor(emails: string[]) {
        super(
            `There are ${emails.length} active admins and none was chosen.`,
            "CLI_TOKEN_ADMIN_AMBIGUOUS",
            400,
            EXIT_CODES.USAGE,
            {
                path: "--admin",
                fix: `Pass --admin <email> or set ${ENV_NAMES.ADMIN_EMAIL}. Active admins: ${emails.join(", ")}.`,
            }
        );
    }
}
