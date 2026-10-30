import { EXIT_CODES } from "../consts/exitCodes";
import type { RemoteUrlProblem } from "../types";
import { CliError } from "./CliError";

const MESSAGE_BY_PROBLEM: Record<RemoteUrlProblem, string> = {
    INVALID: "The URL of the instance is not a valid http or https address.",
    INSECURE: "The URL of the instance uses http on a host that is not local.",
};

const FIX_BY_PROBLEM: Record<RemoteUrlProblem, string> = {
    INVALID:
        "Use the full address of the API, such as https://standin.example.com.",
    INSECURE:
        "Use https: the token would travel in clear text. Plain http is accepted only for localhost, 127.0.0.1 and ::1.",
};

// The URL is not an http or https address, or it is http for a host that is
// not on this machine. The value is not echoed, it may carry credentials.
export class RemoteUrlInvalidError extends CliError {
    constructor(problem: RemoteUrlProblem = "INVALID") {
        super(
            MESSAGE_BY_PROBLEM[problem],
            "CLI_REMOTE_URL_INVALID",
            400,
            EXIT_CODES.USAGE,
            { path: "--url", fix: FIX_BY_PROBLEM[problem] }
        );
    }
}
