import { BYTES_IN_KB } from "../consts/uploadFile";

// The size of a file in KB, at least 1 so a small file does not read as 0.
export const getFileSizeKb = (file: File): number =>
    Math.max(Math.round(file.size / BYTES_IN_KB), 1);
