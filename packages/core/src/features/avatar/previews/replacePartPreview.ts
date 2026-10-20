import { avatarPartsTable, eq } from "@standin/database";
import { AVATAR_PARTS_FOLDER } from "../consts/storage";
import type { AvatarUpload } from "../types";
import { buildFileUrl } from "../../../lib/buildFileUrl";
import { storeAvatarPreview } from "../utils/storeAvatarPreview";
import { findPartPreviewFileId } from "./findPartPreviewRow";

/**
 * Puts the thumbnail shown in the part list in a part or in one of its color
 * variations, or swaps the one it has. The new url is returned.
 */
export const replacePartPreview = async (
    partId: string,
    image: AvatarUpload | undefined
): Promise<{ previewUrl: string }> => {
    const previousFileId = await findPartPreviewFileId(partId);
    let newFileId = "";
    await storeAvatarPreview(
        image,
        previousFileId,
        AVATAR_PARTS_FOLDER,
        async (tx, fileId) => {
            newFileId = fileId;
            await tx
                .update(avatarPartsTable)
                .set({ previewFileId: fileId, updatedAt: new Date() })
                .where(eq(avatarPartsTable.id, partId));
        }
    );
    return { previewUrl: buildFileUrl(newFileId) };
};
