import { SpecFileUnreadableError } from "../../../errors/SpecFileUnreadableError";
import type { CliFiles } from "../../../types";
import { findErrorCode } from "../../../utils/findErrorCode";

const UNREADABLE: string = "it cannot be read";

// The text of the spec file. The code of the failure (ENOENT, EACCES) says
// why; the message of the system is not repeated, it holds the path again.
export const readSpecText = async (
    files: CliFiles,
    file: string
): Promise<string> => {
    try {
        return await files.readText(file);
    } catch (error) {
        throw new SpecFileUnreadableError(
            file,
            findErrorCode(error) ?? UNREADABLE
        );
    }
};
