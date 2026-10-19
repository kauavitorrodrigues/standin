import { PART_CREATE_MESSAGES } from "../../consts/partCreate";
import { decodeSheet } from "../decodeSheet";
import { validateSheetFile } from "./validateSheetFile";

export type SheetFileReading = {
    pixels: Uint8Array | null;
    // What is wrong with the file, or null when it can be used.
    issue: string | null;
};

// Checks a chosen sheet the way the form does before sending it and, when it
// is fine, reads its RGBA. A file with a problem answers the message instead
// of throwing, so the page can show it beside the field.
export const readSheetFile = async (file: File): Promise<SheetFileReading> => {
    const issue = await validateSheetFile(file);
    if (issue !== null) return { pixels: null, issue };

    // `decodeSheet` reads a url, and an object url serves the file itself.
    const url = URL.createObjectURL(file);
    try {
        return { pixels: await decodeSheet(url), issue: null };
    } catch {
        return {
            pixels: null,
            issue: PART_CREATE_MESSAGES.SHEET_DECODE_FAILED,
        };
    } finally {
        URL.revokeObjectURL(url);
    }
};
