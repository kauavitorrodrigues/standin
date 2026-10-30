import { EXIT_CODES } from "../consts/exitCodes";
import { UNAVAILABLE_FIX } from "../consts/hints";
import { CliError } from "./CliError";

// The instance did not answer. The URL is not echoed, it may carry a path the
// operator treats as private; the code says what happened.
export class ApiNetworkError extends CliError {
    constructor(networkCode: string) {
        super(
            `Cannot reach the instance (${networkCode}).`,
            "CLI_API_UNREACHABLE",
            503,
            EXIT_CODES.NETWORK,
            { fix: UNAVAILABLE_FIX }
        );
    }
}
