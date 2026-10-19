import { avatarBasesTable, eq } from "@standin/database";
import {
    AVATAR_BASE_KINDS,
    ImageFileRequiredIssue,
    LibraryValidationError,
} from "@standin/contracts";
import type { AvatarBase } from "@standin/contracts";
import { softDeleteFile } from "../../assets/library/utils/softDeleteFile";
import { regenerateForBase } from "../sheets/regenerateForBase";
import { AVATAR_BASES_FOLDER } from "../consts/folders";
import type { AvatarSheetWarning, AvatarUpload } from "../types";
import { toSheetUpload } from "../utils/toSheetUpload";
import { validateAvatarSheet } from "../utils/validateAvatarSheet";
import { withStoredSheets } from "../utils/withStoredSheets";
import { findActiveBaseRow } from "./utils/findBaseRow";
import { loadAvatarBase } from "./utils/loadBase";

type ReplaceBaseSheetResult = {
    base: AvatarBase;
    warnings: AvatarSheetWarning[];
};

/**
 * Puts a new sprite sheet in a base. Every swap creates a new `files` row, so
 * the `config_hash` of everyone who uses the base changes by itself. The old
 * row gets a soft delete, then the sheets of those people are assembled again
 * (see `regenerateForBase`). A mannequin is in no sheet, so it assembles
 * nothing.
 */
export const replaceBaseSheet = async (
    baseId: string,
    image: AvatarUpload | undefined
): Promise<ReplaceBaseSheetResult> => {
    const row = await findActiveBaseRow(baseId);
    if (!image) {
        throw new LibraryValidationError([new ImageFileRequiredIssue()]);
    }
    const { warnings } = validateAvatarSheet(image.buffer);

    await withStoredSheets(
        [toSheetUpload(image, "base.png")],
        AVATAR_BASES_FOLDER,
        async (tx, [fileId]) => {
            await tx
                .update(avatarBasesTable)
                .set({ fileId: fileId!, updatedAt: new Date() })
                .where(eq(avatarBasesTable.id, baseId));
            await softDeleteFile(row.fileId, tx);
        }
    );

    if (row.kind === AVATAR_BASE_KINDS.BODY) await regenerateForBase(baseId);
    return { base: await loadAvatarBase(baseId), warnings };
};
