import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The content folder does not exist or cannot be listed.
export class ContentFolderUnreadableError extends CliError {
    constructor(folder: string, detail: string) {
        super(
            `Cannot read the content folder ${folder}: ${detail}`,
            "CLI_CONTENT_FOLDER_UNREADABLE",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: folder,
                fix: "Pass a folder with a library.json and/or a templates/ folder.",
            }
        );
    }
}
