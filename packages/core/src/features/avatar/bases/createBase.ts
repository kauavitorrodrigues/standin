import { and, avatarBasesTable, db, eq, isNull } from "@standin/database";
import {
    ImageFileRequiredIssue,
    LibraryValidationError,
} from "@standin/contracts";
import type {
    AvatarBase,
    AvatarBaseKind,
    CreateAvatarBaseData,
} from "@standin/contracts";
import { AVATAR_BASES_FOLDER } from "../consts/folders";
import type { AvatarSheetWarning, AvatarUpload } from "../types";
import { toSheetUpload } from "../utils/toSheetUpload";
import { validateAvatarPreview } from "../utils/validateAvatarPreview";
import { validateAvatarSheet } from "../utils/validateAvatarSheet";
import { withStoredSheets } from "../utils/withStoredSheets";
import { loadAvatarBase } from "./utils/loadBase";
import { resolveBaseKey } from "./utils/resolveBaseKey";
import { translateBaseKeyConflict } from "./utils/translateBaseKeyConflict";
import { unsetDefaultBase } from "./utils/unsetDefaultBase";

type CreateBaseResult = { base: AvatarBase; warnings: AvatarSheetWarning[] };

const hasActiveDefault = async (kind: AvatarBaseKind): Promise<boolean> => {
    const [row] = await db
        .select({ id: avatarBasesTable.id })
        .from(avatarBasesTable)
        .where(
            and(
                eq(avatarBasesTable.kind, kind),
                eq(avatarBasesTable.isDefault, true),
                isNull(avatarBasesTable.deletedAt)
            )
        );
    return row !== undefined;
};

/**
 * Creates a base from its sprite sheet (required), an optional preview and the
 * validated fields. The sheet and the preview are checked before anything is
 * written. The first base of a kind becomes the default of that kind by
 * itself, and a base created as default takes the flag from the previous one
 * of the same kind.
 */
export const createBase = async (
    sheet: AvatarUpload | undefined,
    preview: AvatarUpload | undefined,
    data: CreateAvatarBaseData,
    { createdBy }: { createdBy: string }
): Promise<CreateBaseResult> => {
    if (!sheet) {
        throw new LibraryValidationError([new ImageFileRequiredIssue()]);
    }
    const sheetCheck = validateAvatarSheet(sheet.buffer);
    if (preview) validateAvatarPreview(preview.buffer);

    const key = await resolveBaseKey(data.key, data.name);
    const isDefault = data.isDefault || !(await hasActiveDefault(data.kind));
    const uploads = [toSheetUpload(sheet, "base.png")];
    if (preview) uploads.push(toSheetUpload(preview, "preview.png"));

    let baseId: string;
    try {
        baseId = await withStoredSheets(
            uploads,
            AVATAR_BASES_FOLDER,
            async (tx, [fileId, previewFileId]) => {
                if (isDefault) await unsetDefaultBase(tx, data.kind);
                const [created] = await tx
                    .insert(avatarBasesTable)
                    .values({
                        fileId: fileId!,
                        previewFileId: previewFileId ?? null,
                        createdBy,
                        key,
                        name: data.name,
                        kind: data.kind,
                        isDefault,
                    })
                    .returning({ id: avatarBasesTable.id });
                return created!.id;
            }
        );
    } catch (error) {
        return translateBaseKeyConflict(error);
    }

    return {
        base: await loadAvatarBase(baseId),
        warnings: sheetCheck.warnings,
    };
};
