import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// A flag or an argument that does not exist or has no valid form.
export class UsageError extends CliError {
    constructor(message: string) {
        super(message, "CLI_USAGE", 400, EXIT_CODES.USAGE, {
            fix: "Run the command with --help to see the options and examples.",
        });
    }
}
