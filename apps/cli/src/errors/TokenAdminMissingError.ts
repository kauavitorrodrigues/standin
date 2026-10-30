import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The instance has no admin, so no token can be issued yet. Like a seed with
// no admin, it is the state of the instance blocking the command.
export class TokenAdminMissingError extends CliError {
    constructor() {
        super(
            "There is no active admin to own the token.",
            "CLI_TOKEN_ADMIN_MISSING",
            409,
            EXIT_CODES.CONFLICT,
            {
                fix: "Run `pnpm -s standin bootstrap --email <email>` first.",
            }
        );
    }
}
