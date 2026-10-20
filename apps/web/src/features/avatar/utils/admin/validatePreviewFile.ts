import { getPreviewIssue } from "./getPreviewIssue";
import { readPngHeader } from "./readPngHeader";

// Checks a chosen preview before it is sent. Returns the message, or null.
export const validatePreviewFile = async (file: File): Promise<string | null> =>
    getPreviewIssue(file.size, await readPngHeader(file));
