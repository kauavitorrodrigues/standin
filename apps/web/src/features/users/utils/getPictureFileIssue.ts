import { PROFILE_PICTURE } from "@standin/contracts";
import { PROFILE_PICTURE_MESSAGES } from "../consts/messages";

/**
 * What is wrong with a chosen or dropped file that can be told without
 * decoding it: its format and its size. Null means it can go on. The server
 * checks everything again.
 */
export const getPictureFileIssue = (file: File): string | null => {
    const isAccepted = PROFILE_PICTURE.acceptedMimeTypes.some(
        (accepted) => accepted === file.type
    );
    if (!isAccepted) return PROFILE_PICTURE_MESSAGES.FORMAT_NOT_ACCEPTED;

    if (file.size > PROFILE_PICTURE.maxBytes) {
        return PROFILE_PICTURE_MESSAGES.FILE_TOO_LARGE;
    }

    return null;
};
