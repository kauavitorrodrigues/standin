import { avatarPartsTable } from "@standin/database";
import {
    AvatarVariationInvalidError,
    ImageFileRequiredIssue,
    LibraryValidationError,
    PreviewFileRequiredIssue,
} from "@standin/contracts";
import type { AvatarPart, CreateAvatarVariationData } from "@standin/contracts";
import { AVATAR_PARTS_FOLDER } from "../consts/storage";
import type { AvatarSheetWarning, AvatarUpload } from "../types";
import { assertFamilyColorFree } from "../utils/assertFamilyColorFree";
import { findActivePartRow } from "../utils/findPartRow";
import { loadAvatarPart } from "../utils/loadPartResult";
import { resolveVariationKey } from "../utils/resolveVariationKey";
import { toSheetUpload } from "../utils/toSheetUpload";
import { translatePartConflict } from "../utils/translatePartConflict";
import { validateAvatarPreview } from "../utils/validateAvatarPreview";
import { validateAvatarSheet } from "../utils/validateAvatarSheet";
import { withStoredSheets } from "../utils/withStoredSheets";

type CreateVariationResult = {
    part: AvatarPart;
    warnings: AvatarSheetWarning[];
};

/**
 * Adds a color to a base part from its own sprite PNG and preview PNG, both
 * required. The name and the slot come from the base and the key is derived
 * from the key of the base and the color. The base has to be a base row with
 * a color of its own, so every row of the family has a swatch, and the color
 * name has to be free in the family. The answer is the whole family.
 */
export const createVariation = async (
    baseId: string,
    sheet: AvatarUpload | undefined,
    preview: AvatarUpload | undefined,
    data: CreateAvatarVariationData,
    { createdBy }: { createdBy: string }
): Promise<CreateVariationResult> => {
    const base = await findActivePartRow(baseId);
    if (base.basePartId !== null || base.colorKey === null) {
        throw new AvatarVariationInvalidError();
    }
    if (!sheet) {
        throw new LibraryValidationError([new ImageFileRequiredIssue()]);
    }
    if (!preview) {
        throw new LibraryValidationError([new PreviewFileRequiredIssue()]);
    }
    const sheetCheck = validateAvatarSheet(sheet.buffer);
    validateAvatarPreview(preview.buffer);

    await assertFamilyColorFree(base.id, data.colorKey, null);
    const key = await resolveVariationKey(base.key, data.colorKey);
    const uploads = [
        toSheetUpload(sheet, "sheet.png"),
        toSheetUpload(preview, "preview.png"),
    ];

    try {
        await withStoredSheets(
            uploads,
            AVATAR_PARTS_FOLDER,
            async (tx, [fileId, previewFileId]) => {
                await tx.insert(avatarPartsTable).values({
                    basePartId: base.id,
                    fileId: fileId!,
                    previewFileId: previewFileId!,
                    createdBy,
                    key,
                    name: base.name,
                    slot: base.slot,
                    colorKey: data.colorKey,
                    colorHex: data.colorHex,
                });
            }
        );
    } catch (error) {
        return translatePartConflict(error);
    }

    return {
        part: await loadAvatarPart(base.id),
        warnings: sheetCheck.warnings,
    };
};
