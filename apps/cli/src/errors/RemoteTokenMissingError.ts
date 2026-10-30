import { ENV_NAMES } from "../consts/env";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// No token from the flag, the environment or the login file.
export class RemoteTokenMissingError extends CliError {
    constructor() {
        super(
            "The service token is missing.",
            "CLI_REMOTE_TOKEN_MISSING",
            400,
            EXIT_CODES.USAGE,
            {
                path: "--token",
                fix: `Pass --token <token>, set ${ENV_NAMES.STANDIN_TOKEN}, or run \`pnpm -s standin login\`. Create a token on the server with \`pnpm -s standin token create\`.`,
            }
        );
    }
}
