import { db, avatarPartsTable, and, eq, isNull } from "@standin/database";
import { avatarPartColumns } from "./avatarPartColumns";

// The key of a variation comes from the key of the part and the color name,
// so the color name is what finds it again.
/** The live variation of a part with this color name, or null. */
export const findAvatarVariation = async (baseId: string, colorKey: string) => {
    const [row] = await db
        .select(avatarPartColumns)
        .from(avatarPartsTable)
        .where(
            and(
                eq(avatarPartsTable.basePartId, baseId),
                eq(avatarPartsTable.colorKey, colorKey),
                isNull(avatarPartsTable.deletedAt)
            )
        );
    return row ?? null;
};
