import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The folder is missing, has no valid library.json, or points at a file that
// cannot be read.
export class LibraryFolderInvalidError extends CliError {
    constructor(folder: string, detail: string) {
        super(
            `Cannot read the library folder ${folder}: ${detail}`,
            "CLI_LIBRARY_FOLDER_INVALID",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: folder,
                fix: "Point to a folder with a valid library.json and the PNGs it names.",
            }
        );
    }
}
