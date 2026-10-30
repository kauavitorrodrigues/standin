import { db, soundboardClipsTable, eq } from "@standin/database";
import { SoundboardClipForbiddenError } from "@standin/contracts";
import { FileService } from "../files";
import type { SoundboardViewer } from "./types";
import { canManageClip } from "./utils/canManageClip";
import { findVisibleClip } from "./utils/findClip";

/**
 * Soft deletes a clip and its file. The object leaves storage only after the
 * transaction commits, so a rollback never loses a file a row still needs.
 */
export const deleteClip = async (
    id: string,
    organizationId: string | null,
    viewer: SoundboardViewer
): Promise<void> => {
    const clip = await findVisibleClip(id, organizationId);
    if (!canManageClip(clip, viewer)) throw new SoundboardClipForbiddenError();

    const storageKeys = await db.transaction(async (tx) => {
        await tx
            .update(soundboardClipsTable)
            .set({ deletedAt: new Date() })
            .where(eq(soundboardClipsTable.id, id));
        return FileService.softDeleteManyByIds([clip.fileId], tx);
    });
    await FileService.purge(storageKeys);
};
