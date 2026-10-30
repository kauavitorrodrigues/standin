import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// A success whose body is not the JSON object the API sends: the URL most
// likely points at the web app or at a proxy page, not at the API.
export class ApiResponseInvalidError extends CliError {
    constructor() {
        super(
            "The server answered with something that is not the API.",
            "CLI_API_RESPONSE_INVALID",
            502,
            EXIT_CODES.NETWORK,
            {
                path: "--url",
                fix: "Check that --url points at the API, not at the web app.",
            }
        );
    }
}
