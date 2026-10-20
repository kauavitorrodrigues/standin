import { getSheetIssue } from "./getSheetIssue";
import { readPngHeader } from "./readPngHeader";

// Checks a chosen sheet before it is sent, so the user does not wait for the
// API to say that the grid is wrong. Returns the message, or null.
export const validateSheetFile = async (file: File): Promise<string | null> =>
    getSheetIssue(file.size, await readPngHeader(file));
