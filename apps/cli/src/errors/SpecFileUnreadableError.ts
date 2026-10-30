import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The spec file does not exist or cannot be read.
export class SpecFileUnreadableError extends CliError {
    constructor(file: string, detail: string) {
        super(
            `Cannot read the spec ${file}: ${detail}`,
            "CLI_SPEC_UNREADABLE",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: file,
                fix: "Pass the path of a YAML or JSON spec file.",
            }
        );
    }
}
