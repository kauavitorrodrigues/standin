import { avatarPartsTable, eq } from "@standin/database";
import {
    ImageFileRequiredIssue,
    LibraryValidationError,
} from "@standin/contracts";
import type { AvatarPart } from "@standin/contracts";
import { softDeleteFile } from "../../assets/library/utils/softDeleteFile";
import { AVATAR_PARTS_FOLDER } from "../consts/storage";
import { regenerateForPart } from "../sheets/regenerateForPart";
import type { AvatarSheetWarning, AvatarUpload } from "../types";
import { findActivePartRow } from "./findPartRow";
import { loadAvatarPart } from "./loadPartResult";
import { toSheetUpload } from "./toSheetUpload";
import { validateAvatarSheet } from "./validateAvatarSheet";
import { withStoredSheets } from "./withStoredSheets";

export type SwapPartSheetResult = {
    part: AvatarPart;
    warnings: AvatarSheetWarning[];
};

/**
 * Puts a new sprite PNG on a part. Every swap creates a new `files` row, so
 * the `config_hash` of everyone who uses the part changes by itself. The old
 * row gets a soft delete, then the sheets of those people are assembled again
 * (see `regenerateForPart`).
 */
export const swapPartSheet = async (
    partId: string,
    image: AvatarUpload | undefined
): Promise<SwapPartSheetResult> => {
    const row = await findActivePartRow(partId);
    if (!image) {
        throw new LibraryValidationError([new ImageFileRequiredIssue()]);
    }
    const { warnings } = validateAvatarSheet(image.buffer);
    const previousFileId = row.fileId;

    await withStoredSheets(
        [toSheetUpload(image, "sheet.png")],
        AVATAR_PARTS_FOLDER,
        async (tx, [fileId]) => {
            await tx
                .update(avatarPartsTable)
                .set({ fileId: fileId!, updatedAt: new Date() })
                .where(eq(avatarPartsTable.id, partId));
            await softDeleteFile(previousFileId, tx);
        }
    );

    await regenerateForPart(partId);
    return { part: await loadAvatarPart(partId), warnings };
};
