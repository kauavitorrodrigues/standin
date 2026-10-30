import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The server keeps saying there is one more page of the library.
export class LibraryPagesExceededError extends CliError {
    constructor(limit: number) {
        super(
            `The library has more than ${limit} pages, which is not believed.`,
            "CLI_LIBRARY_PAGES_EXCEEDED",
            502,
            EXIT_CODES.NETWORK,
            {
                fix: "Check that --url points at the API of a Standin instance.",
            }
        );
    }
}
