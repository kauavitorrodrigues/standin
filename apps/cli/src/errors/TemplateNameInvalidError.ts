import { FLAGS, SPEC_FIELDS } from "../consts/flags";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The name of the template is one the server would refuse.
export class TemplateNameInvalidError extends CliError {
    constructor(problem: string) {
        super(
            `The template name is not valid: ${problem}.`,
            "CLI_TEMPLATE_NAME_INVALID",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: SPEC_FIELDS.NAME,
                fix: "Pass a name of 2 to 100 characters.",
            }
        );
    }
}
