import { avatarBasesTable, eq } from "@standin/database";
import type { AvatarBase } from "@standin/contracts";
import { clearAvatarPreview } from "../utils/clearAvatarPreview";
import { findActiveBaseRow } from "./utils/findBaseRow";
import { loadAvatarBase } from "./utils/loadBase";

/** Removes the preview of a base. A base without one is returned as it is. */
export const removeBasePreview = async (
    baseId: string
): Promise<AvatarBase> => {
    const row = await findActiveBaseRow(baseId);
    await clearAvatarPreview(row.previewFileId, async (tx) => {
        await tx
            .update(avatarBasesTable)
            .set({ previewFileId: null, updatedAt: new Date() })
            .where(eq(avatarBasesTable.id, baseId));
    });
    return loadAvatarBase(baseId);
};
