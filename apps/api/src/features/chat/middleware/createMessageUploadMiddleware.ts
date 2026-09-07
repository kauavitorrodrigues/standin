import path from "node:path";
import multer from "multer";
import {
    ALLOWED_EXTENSIONS_BY_MIME_TYPE,
    CHAT_ATTACHMENT_MIME_TYPES,
    MAX_MESSAGE_ATTACHMENTS,
    MAX_UPLOAD_SIZE_IN_BYTES,
    UnsupportedFileTypeError,
} from "@standin/contracts";

const ALLOWED_MIME_TYPES: readonly string[] = CHAT_ATTACHMENT_MIME_TYPES;

export const uploadMessageAttachments = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const allowedExtensions =
            ALLOWED_EXTENSIONS_BY_MIME_TYPE[file.mimetype];

        if (
            !ALLOWED_MIME_TYPES.includes(file.mimetype) ||
            !allowedExtensions?.includes(extension)
        ) {
            return cb(new UnsupportedFileTypeError());
        }

        cb(null, true);
    },
    limits: {
        fileSize: MAX_UPLOAD_SIZE_IN_BYTES,
        files: MAX_MESSAGE_ATTACHMENTS,
    },
}).array("attachments", MAX_MESSAGE_ATTACHMENTS);
