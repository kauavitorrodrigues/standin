import { and, avatarPartsTable, db, eq, isNull } from "@standin/database";
import { AvatarPartNotFoundError } from "@standin/contracts";

/**
 * The id of the preview of a part (a base part or a color variation, both are
 * rows of the same table) that is not deleted, or `AvatarPartNotFoundError`.
 */
export const findPartPreviewFileId = async (
    partId: string
): Promise<string | null> => {
    const [row] = await db
        .select({ previewFileId: avatarPartsTable.previewFileId })
        .from(avatarPartsTable)
        .where(
            and(
                eq(avatarPartsTable.id, partId),
                isNull(avatarPartsTable.deletedAt)
            )
        );
    if (!row) throw new AvatarPartNotFoundError();
    return row.previewFileId;
};
