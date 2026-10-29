import { db, avatarPartsTable, and, eq, isNull } from "@standin/database";
import { avatarPartColumns } from "./avatarPartColumns";

/** The live avatar part, or variation, with this key, or null. */
export const findAvatarPartByKey = async (key: string) => {
    const [row] = await db
        .select(avatarPartColumns)
        .from(avatarPartsTable)
        .where(
            and(
                eq(avatarPartsTable.key, key),
                isNull(avatarPartsTable.deletedAt)
            )
        );
    return row ?? null;
};
