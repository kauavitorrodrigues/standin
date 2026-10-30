import { EXIT_CODES } from "../consts/exitCodes";
import type { ErrorIssue } from "../types";
import { CliError } from "./CliError";

// --publish found drafts of the instance that cannot be published as they
// are: they have no thumbnail. Nothing was written when this is raised.
export class TemplateNotPublishableError extends CliError {
    constructor(issues: ErrorIssue[]) {
        super(
            "A template that exists cannot be published.",
            "CLI_TEMPLATE_NOT_PUBLISHABLE",
            422,
            EXIT_CODES.VALIDATION,
            {
                issues,
                fix: "Finish the draft in the editor (give it its thumbnail and content), or delete it on the admin screen and run the command again.",
            }
        );
    }
}
