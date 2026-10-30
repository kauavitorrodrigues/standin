import { EXIT_CODES } from "../consts/exitCodes";
import type { ErrorIssue } from "../types";
import { CliError } from "./CliError";

// The name, scopes or expiry of the token break the rules of the contract.
export class TokenInputInvalidError extends CliError {
    constructor(issues: ErrorIssue[]) {
        super(
            "The token input is not valid.",
            "CLI_TOKEN_INPUT_INVALID",
            422,
            EXIT_CODES.VALIDATION,
            {
                issues,
                fix: "Pass --name, one or more --scope values and, optionally, --expires-at as an ISO 8601 UTC date such as 2027-01-01T00:00:00Z.",
            }
        );
    }
}
