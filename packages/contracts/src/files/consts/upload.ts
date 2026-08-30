import { GENERIC_UPLOAD_MIME_TYPES } from "../enums/allowed-mime-types";

export const MAX_UPLOAD_SIZE_IN_BYTES = 10 * 1024 * 1024; // 10 MB

export const UPLOAD_LIMITS = {
    generic: {
        allowedMimeTypes: GENERIC_UPLOAD_MIME_TYPES,
        maxSizeInBytes: MAX_UPLOAD_SIZE_IN_BYTES,
    },
};
