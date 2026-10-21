import { PROFILE_PICTURE } from "@standin/contracts";
import { PROFILE_PICTURE_MESSAGES } from "../consts/messages";
import { getPictureFileIssue } from "./getPictureFileIssue";
import { readImageSize } from "./readImageSize";

/**
 * The checks that only warn early, before the upload: the format and size of
 * the file, then the size of the image once the browser decodes it. Answers
 * the message of the first problem, or null when the file can be sent. The
 * server decides in the end.
 */
export const validateChosenPicture = async (
    file: File
): Promise<string | null> => {
    const fileIssue = getPictureFileIssue(file);
    if (fileIssue) return fileIssue;

    const size = await readImageSize(file);
    if (!size) return PROFILE_PICTURE_MESSAGES.IMAGE_UNREADABLE;
    if (Math.min(size.width, size.height) < PROFILE_PICTURE.minSide) {
        return PROFILE_PICTURE_MESSAGES.IMAGE_TOO_SMALL;
    }

    return null;
};
