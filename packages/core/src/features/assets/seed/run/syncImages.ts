import { replaceFront } from "../../../avatar/parts/replaceFront";
import { replacePartPreview } from "../../../avatar/previews/replacePartPreview";
import { isSameFileById } from "../compare/isSameFileById";
import { assertImagesValid } from "./assertImagesValid";
import type { SeedAvatarImages, SeedAvatarPartRow } from "../types";

// Swaps the images that differ. Both are checked before the first swap, so a
// bad preview cannot leave a new sheet behind. Returns whether anything was
// swapped.
export const syncImages = async (
    row: SeedAvatarPartRow,
    { image, preview }: SeedAvatarImages
): Promise<boolean> => {
    const sheetChanged = !(await isSameFileById(row.fileId, image));
    const previewChanged = !(await isSameFileById(row.previewFileId, preview));
    assertImagesValid({
        sheet: sheetChanged ? image : undefined,
        preview: previewChanged ? preview : undefined,
    });
    if (sheetChanged) await replaceFront(row.id, { buffer: image });
    if (previewChanged) await replacePartPreview(row.id, { buffer: preview });
    return sheetChanged || previewChanged;
};
