import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// The thumbnail cannot be read, is too large, or is not a PNG. It is checked
// before any request.
export class TemplateThumbnailInvalidError extends CliError {
    constructor(file: string, detail: string) {
        super(
            `The thumbnail ${file} cannot be used: ${detail}`,
            "CLI_TEMPLATE_THUMBNAIL_INVALID",
            422,
            EXIT_CODES.VALIDATION,
            {
                path: file,
                fix: "Pass a PNG of at most 3 MB.",
            }
        );
    }
}
