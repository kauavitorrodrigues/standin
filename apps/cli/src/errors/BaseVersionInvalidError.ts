import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// --base-version is not a whole number from 1.
export class BaseVersionInvalidError extends CliError {
    constructor() {
        super(
            "--base-version must be a whole number from 1.",
            "CLI_BASE_VERSION_INVALID",
            400,
            EXIT_CODES.USAGE,
            {
                path: "--base-version",
                fix: "Pass the layout version you read, or leave the flag out to use the current one.",
            }
        );
    }
}
