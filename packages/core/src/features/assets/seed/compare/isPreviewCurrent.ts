import { isSameFileById } from "./isSameFileById";

// A preview the entry leaves out is not compared.
export const isPreviewCurrent = async (
    previewFileId: string | null,
    preview: Buffer | undefined
): Promise<boolean> => {
    if (!preview) return true;
    return previewFileId ? isSameFileById(previewFileId, preview) : false;
};
