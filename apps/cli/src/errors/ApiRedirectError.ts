import { EXIT_CODES } from "../consts/exitCodes";
import { buildRedirectFix } from "../utils/buildRedirectFix";
import { CliError } from "./CliError";

// The server redirected. The token is not sent to a place the operator did
// not name, so the redirect is not followed.
export class ApiRedirectError extends CliError {
    constructor(status: number, destination: string | undefined) {
        super(
            `The server redirected the request (${status}).`,
            "CLI_API_REDIRECTED",
            502,
            EXIT_CODES.NETWORK,
            { path: "--url", fix: buildRedirectFix(destination) }
        );
    }
}
