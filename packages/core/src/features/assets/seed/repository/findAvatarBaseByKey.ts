import { db, avatarBasesTable, and, eq, isNull } from "@standin/database";

/** The live avatar base with this key, or null. */
export const findAvatarBaseByKey = async (key: string) => {
    const [row] = await db
        .select({
            id: avatarBasesTable.id,
            name: avatarBasesTable.name,
            kind: avatarBasesTable.kind,
            isDefault: avatarBasesTable.isDefault,
            fileId: avatarBasesTable.fileId,
            previewFileId: avatarBasesTable.previewFileId,
        })
        .from(avatarBasesTable)
        .where(
            and(
                eq(avatarBasesTable.key, key),
                isNull(avatarBasesTable.deletedAt)
            )
        );
    return row ?? null;
};
