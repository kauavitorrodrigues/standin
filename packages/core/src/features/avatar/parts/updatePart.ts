import { avatarPartsTable, db, eq, or } from "@standin/database";
import type { AvatarPart, UpdateAvatarPartData } from "@standin/contracts";
import { assertFamilyColorFree } from "../utils/assertFamilyColorFree";
import { findActivePartRow } from "../utils/findPartRow";
import { loadAvatarPart } from "../utils/loadPartResult";
import { translatePartConflict } from "../utils/translatePartConflict";

/**
 * Changes the name of the family and the color of one row. The id can be the
 * one of the base or of a variation. The name is shared by every row of the
 * family, so it is written to all of them. The color name and the swatch come
 * as a pair and the name has to be free in the family. The answer is the
 * whole family.
 */
export const updatePart = async (
    partId: string,
    data: UpdateAvatarPartData
): Promise<AvatarPart> => {
    const row = await findActivePartRow(partId);
    const familyId = row.basePartId ?? row.id;

    if (data.colorKey !== undefined) {
        await assertFamilyColorFree(familyId, data.colorKey, row.id);
    }

    try {
        await db.transaction(async (tx) => {
            if (data.name !== undefined) {
                await tx
                    .update(avatarPartsTable)
                    .set({ name: data.name, updatedAt: new Date() })
                    .where(
                        or(
                            eq(avatarPartsTable.id, familyId),
                            eq(avatarPartsTable.basePartId, familyId)
                        )
                    );
            }
            if (data.colorKey !== undefined && data.colorHex !== undefined) {
                await tx
                    .update(avatarPartsTable)
                    .set({
                        colorKey: data.colorKey,
                        colorHex: data.colorHex,
                        updatedAt: new Date(),
                    })
                    .where(eq(avatarPartsTable.id, row.id));
            }
        });
    } catch (error) {
        return translatePartConflict(error);
    }
    return loadAvatarPart(partId);
};
