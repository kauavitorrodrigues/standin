import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// A required value that came neither from the flag nor from the environment,
// and there is no terminal to ask for it.
export class MissingOptionError extends CliError {
    constructor(flag: string, envName: string) {
        super(
            `${flag} is required.`,
            "CLI_MISSING_OPTION",
            400,
            EXIT_CODES.USAGE,
            { path: flag, fix: `Pass ${flag} <value> or set ${envName}.` }
        );
    }
}
