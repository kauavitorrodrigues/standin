import { MAX_UPLOAD_BYTES } from "@standin/contracts";

// First bytes of every PNG file.
export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export const BYTES_IN_KB = 1024;

export const MAX_UPLOAD_KB = Math.round(MAX_UPLOAD_BYTES / BYTES_IN_KB);

export const UPLOAD_FIELDS = {
    IMAGE: "image",
    DATA: "data",
} as const;
