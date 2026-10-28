import { UPLOAD_LIMITS } from "@standin/contracts";
import { createUploadMiddleware } from "../../files/middleware/createUploadMiddleware";

export const uploadSpaceThumbnail = createUploadMiddleware(
    UPLOAD_LIMITS.thumbnail
).single("thumbnail");
