import type { Response } from "express";
import {
    ProfilePictureFileValidationSchema,
    ProfilePictureInvalidError,
    ProfilePictureTooLargeError,
} from "@standin/contracts";
import { sendError } from "@/utils/sendError";

/**
 * Checks what the client says about the file, its mime type and its size.
 * Answers the error itself and returns false when it is refused. The content
 * is checked again when the image is decoded.
 */
export const validateProfilePictureFile = (
    file: Express.Multer.File,
    res: Response
): boolean => {
    const validation = ProfilePictureFileValidationSchema.safeParse({
        mimetype: file.mimetype,
        size: file.size,
    });
    if (validation.success) return true;

    const [issue] = validation.error.issues;
    const reportError =
        issue.path[0] === "size"
            ? new ProfilePictureTooLargeError()
            : new ProfilePictureInvalidError();
    sendError({ res, reportError });
    return false;
};
