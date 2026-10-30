import { FLAGS, SPEC_FIELDS } from "../consts/flags";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The spec of a template is not of kind "template".
export class TemplateSpecKindError extends CliError {
    constructor(kind: string) {
        super(
            `A template is built from a spec of kind "template", not "${kind}".`,
            "CLI_TEMPLATE_SPEC_KIND",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: SPEC_FIELDS.KIND,
                fix: "Set kind: template in the spec. `pnpm -s standin schema print spec` prints the format.",
            }
        );
    }
}
