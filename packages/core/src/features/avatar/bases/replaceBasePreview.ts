import { avatarBasesTable, eq } from "@standin/database";
import type { AvatarBase } from "@standin/contracts";
import { AVATAR_BASES_FOLDER } from "../consts/folders";
import type { AvatarUpload } from "../types";
import { storeAvatarPreview } from "../utils/storeAvatarPreview";
import { findActiveBaseRow } from "./utils/findBaseRow";
import { loadAvatarBase } from "./utils/loadBase";

/** Puts the image shown in lists in a base, or swaps the one it has. */
export const replaceBasePreview = async (
    baseId: string,
    image: AvatarUpload | undefined
): Promise<AvatarBase> => {
    const row = await findActiveBaseRow(baseId);
    await storeAvatarPreview(
        image,
        row.previewFileId,
        AVATAR_BASES_FOLDER,
        async (tx, fileId) => {
            await tx
                .update(avatarBasesTable)
                .set({ previewFileId: fileId, updatedAt: new Date() })
                .where(eq(avatarBasesTable.id, baseId));
        }
    );
    return loadAvatarBase(baseId);
};
