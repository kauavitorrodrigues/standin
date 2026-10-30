import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The id given to `token revoke` cannot be the id of a token. It is not
// echoed back.
export class TokenIdInvalidError extends CliError {
    constructor() {
        super(
            "The token id is not valid.",
            "CLI_TOKEN_ID_INVALID",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: "id",
                fix: "Run `pnpm -s standin token list` to see the ids of the tokens.",
            }
        );
    }
}
