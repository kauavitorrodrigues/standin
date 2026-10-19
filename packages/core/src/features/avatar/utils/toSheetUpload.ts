import type { AvatarUpload } from "../types";
import type { SheetUpload } from "./withStoredSheets";

export const toSheetUpload = (
    upload: AvatarUpload,
    fallbackName: string
): SheetUpload => ({
    buffer: upload.buffer,
    originalName: upload.originalName ?? fallbackName,
});
