import { EXIT_CODES } from "../consts/exitCodes";
import { describeError } from "./describeError";
import { CliError } from "./CliError";

// A step failed with something the CLI does not know (a bug, an answer of an
// unexpected shape). It is the internal error, with the work already done.
export class UnexpectedStepError extends CliError {
    constructor(cause: unknown) {
        super(describeError(cause), "CLI_INTERNAL", 500, EXIT_CODES.INTERNAL);
    }
}
