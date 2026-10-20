import { AVATAR_UPLOAD_PARTS } from "@standin/contracts";
import type { AvatarUpload } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";

type Files = Record<string, Express.Multer.File[] | undefined>;

/** The `preview` part, or undefined when the request has none. */
export const readPreviewPart = (
    req: ExtendedRequest
): AvatarUpload | undefined => {
    const file = (req.files as Files | undefined)?.[
        AVATAR_UPLOAD_PARTS.PREVIEW
    ]?.[0];
    return file
        ? { buffer: file.buffer, originalName: file.originalname }
        : undefined;
};
