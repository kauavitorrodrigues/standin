import {
    ImageFileRequiredIssue,
    LibraryValidationError,
} from "@standin/contracts";
import type { Transaction } from "@standin/database";
import { softDeleteFile } from "../../assets/library/utils/softDeleteFile";
import type { AvatarUpload } from "../types";
import { toSheetUpload } from "./toSheetUpload";
import { validateAvatarPreview } from "./validateAvatarPreview";
import { withStoredSheets } from "./withStoredSheets";

/**
 * Puts a new preview PNG in the place of the old one. The new file is stored
 * and `apply` points the owner row at it, in one transaction. The old `files`
 * row gets a soft delete. Nothing is assembled again, because a preview never
 * enters a sheet.
 */
export const storeAvatarPreview = async (
    image: AvatarUpload | undefined,
    previousFileId: string | null,
    folder: string,
    apply: (tx: Transaction, fileId: string) => Promise<void>
): Promise<void> => {
    if (!image) {
        throw new LibraryValidationError([new ImageFileRequiredIssue()]);
    }
    validateAvatarPreview(image.buffer);

    await withStoredSheets(
        [toSheetUpload(image, "preview.png")],
        folder,
        async (tx, [fileId]) => {
            await apply(tx, fileId!);
            if (previousFileId !== null) {
                await softDeleteFile(previousFileId, tx);
            }
        }
    );
};
