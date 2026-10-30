import { ContentFolderUnreadableError } from "../../../errors/ContentFolderUnreadableError";
import type { CliFiles, FolderEntry } from "../../../types";
import { UNKNOWN_CODE } from "../../../consts/fs";
import { findErrorCode } from "../../../utils/findErrorCode";

// The entries of the content folder. A folder that cannot be listed is an
// error of the input, with the code of the system.
export const listContentFolder = async (
    files: CliFiles,
    folder: string
): Promise<FolderEntry[]> => {
    try {
        return await files.listDir(folder);
    } catch (error) {
        throw new ContentFolderUnreadableError(
            folder,
            findErrorCode(error) ?? UNKNOWN_CODE
        );
    }
};
