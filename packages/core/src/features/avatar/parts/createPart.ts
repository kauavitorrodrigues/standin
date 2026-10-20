import { avatarPartsTable } from "@standin/database";
import {
    ImageFileRequiredIssue,
    LibraryValidationError,
    PreviewFileRequiredIssue,
} from "@standin/contracts";
import type { AvatarPart, CreateAvatarPartData } from "@standin/contracts";
import { AVATAR_PARTS_FOLDER } from "../consts/storage";
import type { AvatarSheetWarning, AvatarUpload } from "../types";
import { loadAvatarPart } from "../utils/loadPartResult";
import { resolvePartKey } from "../utils/resolvePartKey";
import { toSheetUpload } from "../utils/toSheetUpload";
import { translatePartConflict } from "../utils/translatePartConflict";
import { validateAvatarPreview } from "../utils/validateAvatarPreview";
import { validateAvatarSheet } from "../utils/validateAvatarSheet";
import { withStoredSheets } from "../utils/withStoredSheets";

type CreatePartResult = { part: AvatarPart; warnings: AvatarSheetWarning[] };

/**
 * Creates a part from the sprite PNG and the preview PNG, both required, and
 * the validated fields. Both are checked before anything is written. The key
 * comes from the request or is derived from the slot and the name. The color
 * pair is optional and makes the base row the first color of its family.
 */
export const createPart = async (
    sheet: AvatarUpload | undefined,
    preview: AvatarUpload | undefined,
    data: CreateAvatarPartData,
    { createdBy }: { createdBy: string }
): Promise<CreatePartResult> => {
    if (!sheet) {
        throw new LibraryValidationError([new ImageFileRequiredIssue()]);
    }
    if (!preview) {
        throw new LibraryValidationError([new PreviewFileRequiredIssue()]);
    }
    const sheetCheck = validateAvatarSheet(sheet.buffer);
    validateAvatarPreview(preview.buffer);

    const key = await resolvePartKey(data.key, data.name, data.slot);
    const uploads = [
        toSheetUpload(sheet, "sheet.png"),
        toSheetUpload(preview, "preview.png"),
    ];

    let partId: string;
    try {
        partId = await withStoredSheets(
            uploads,
            AVATAR_PARTS_FOLDER,
            async (tx, [fileId, previewFileId]) => {
                const [created] = await tx
                    .insert(avatarPartsTable)
                    .values({
                        fileId: fileId!,
                        previewFileId: previewFileId!,
                        createdBy,
                        key,
                        name: data.name,
                        slot: data.slot,
                        colorKey: data.colorKey ?? null,
                        colorHex: data.colorHex ?? null,
                    })
                    .returning({ id: avatarPartsTable.id });
                return created!.id;
            }
        );
    } catch (error) {
        return translatePartConflict(error);
    }

    return {
        part: await loadAvatarPart(partId),
        warnings: sheetCheck.warnings,
    };
};
