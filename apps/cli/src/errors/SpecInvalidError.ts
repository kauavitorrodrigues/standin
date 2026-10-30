import { EXIT_CODES } from "../consts/exitCodes";
import type { ErrorIssue } from "../types";
import { CliError } from "./CliError";

// The spec does not parse, break the schema, or cannot be built on the map.
// The issues say where, in the spec.
export class SpecInvalidError extends CliError {
    constructor(issues: ErrorIssue[]) {
        super(
            "The spec is not valid.",
            "CLI_SPEC_INVALID",
            422,
            EXIT_CODES.VALIDATION,
            {
                issues,
                fix: "Fix the issues listed and run the command again. `pnpm -s standin schema print spec` prints the format.",
            }
        );
    }
}
