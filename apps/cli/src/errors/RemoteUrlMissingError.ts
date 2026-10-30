import { ENV_NAMES } from "../consts/env";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// No URL from the flag, the environment or the login file.
export class RemoteUrlMissingError extends CliError {
    constructor() {
        super(
            "The URL of the instance is missing.",
            "CLI_REMOTE_URL_MISSING",
            400,
            EXIT_CODES.USAGE,
            {
                path: "--url",
                fix: `Pass --url <url>, set ${ENV_NAMES.STANDIN_URL}, or run \`pnpm -s standin login --url <url> --token <token>\`.`,
            }
        );
    }
}
