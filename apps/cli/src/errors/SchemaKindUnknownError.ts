import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// There is no JSON Schema with that name.
export class SchemaKindUnknownError extends CliError {
    constructor(kind: string, valid: string[]) {
        super(
            `Unknown schema "${kind}".`,
            "CLI_SCHEMA_UNKNOWN",
            400,
            EXIT_CODES.USAGE,
            {
                path: "kind",
                fix: `Use one of: ${valid.join(", ")}.`,
            }
        );
    }
}
