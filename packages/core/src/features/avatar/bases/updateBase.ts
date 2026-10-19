import { avatarBasesTable, db, eq } from "@standin/database";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBase, UpdateAvatarBaseData } from "@standin/contracts";
import { regenerateForBase } from "../sheets/regenerateForBase";
import { findActiveBaseRow } from "./utils/findBaseRow";
import { loadAvatarBase } from "./utils/loadBase";
import { unsetDefaultBase } from "./utils/unsetDefaultBase";

/**
 * Renames a base or makes it the default of its kind. The previous default of
 * that kind loses the flag in the same transaction, so there is always exactly
 * one. The people who chose no base follow the default body, so when it
 * changes their sheets are assembled again (see `regenerateForBase`). A
 * mannequin is in no sheet, so nothing is assembled for it.
 */
export const updateBase = async (
    baseId: string,
    data: UpdateAvatarBaseData
): Promise<AvatarBase> => {
    const row = await findActiveBaseRow(baseId);

    await db.transaction(async (tx) => {
        if (data.isDefault) await unsetDefaultBase(tx, row.kind);
        await tx
            .update(avatarBasesTable)
            .set({
                ...(data.name === undefined ? {} : { name: data.name }),
                ...(data.isDefault ? { isDefault: true } : {}),
                updatedAt: new Date(),
            })
            .where(eq(avatarBasesTable.id, baseId));
    });

    if (data.isDefault && row.kind === AVATAR_BASE_KINDS.BODY) {
        await regenerateForBase(baseId);
    }
    return loadAvatarBase(baseId);
};
