import { UPLOAD_LIMITS } from "@standin/contracts";
import { createUploadMiddleware } from "../../../files/middleware/createUploadMiddleware";

export const uploadTemplateThumbnail = createUploadMiddleware(
    UPLOAD_LIMITS.thumbnail
).single("thumbnail");
