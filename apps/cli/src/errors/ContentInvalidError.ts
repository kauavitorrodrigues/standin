import { EXIT_CODES } from "../consts/exitCodes";
import type { ErrorIssue } from "../types";
import { CliError } from "./CliError";

// The content folder breaks a rule that is checked locally. Each issue says
// the file and the place in it.
export class ContentInvalidError extends CliError {
    constructor(issues: ErrorIssue[]) {
        super(
            "The content folder is not valid.",
            "CLI_CONTENT_INVALID",
            422,
            EXIT_CODES.VALIDATION,
            {
                issues,
                fix: "Fix the issues listed and run the command again.",
            }
        );
    }
}
