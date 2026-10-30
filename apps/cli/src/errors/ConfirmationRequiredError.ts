import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// A destructive command was run from a terminal without --yes. Without a
// terminal (an agent, a script) it never asks and never needs the flag.
export class ConfirmationRequiredError extends CliError {
    constructor(action: string) {
        super(
            `${action} needs confirmation.`,
            "CLI_CONFIRMATION_REQUIRED",
            400,
            EXIT_CODES.USAGE,
            {
                path: "--yes",
                fix: "Run the command again with --yes to confirm.",
            }
        );
    }
}
