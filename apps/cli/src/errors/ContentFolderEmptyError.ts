import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The folder has neither a library.json nor a template spec: nothing to do.
export class ContentFolderEmptyError extends CliError {
    constructor(folder: string) {
        super(
            `The content folder ${folder} has no library.json and no templates.`,
            "CLI_CONTENT_FOLDER_EMPTY",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: folder,
                fix: "Add a library.json (with the PNGs it names) and/or specs in templates/*.yaml, *.yml or *.json. The README of the CLI shows the layout.",
            }
        );
    }
}
