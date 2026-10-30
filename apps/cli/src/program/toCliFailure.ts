import { CommanderError } from "commander";
import { DatabaseUnreachableError } from "../errors/DatabaseUnreachableError";
import { UsageError } from "../errors/UsageError";
import { findErrorCode } from "../utils/findErrorCode";
import { isNetworkError } from "../utils/isNetworkError";
import { redactOptionValue } from "../utils/redactOptionValue";
import { COMMANDER_MESSAGES } from "./commanderCodes";

const COMMANDER_PREFIX = /^error: /;

const describeParseFailure = (error: CommanderError): string => {
    const known: string | undefined = COMMANDER_MESSAGES[error.code];
    if (known) return known;
    return redactOptionValue(error.message.replace(COMMANDER_PREFIX, ""));
};

// Gives a failure the error class that says what it is: a parse failure of
// commander is a usage error, an unreachable database exits 5. Anything else
// is kept.
export const toCliFailure = (error: unknown): unknown => {
    if (error instanceof CommanderError) {
        return new UsageError(describeParseFailure(error));
    }
    if (isNetworkError(error)) {
        return new DatabaseUnreachableError(String(findErrorCode(error)));
    }
    return error;
};
