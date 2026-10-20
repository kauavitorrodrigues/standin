import { publishAvatarSheetChanged } from "../utils/sheetEvents";
import { softDeleteFile } from "../../assets/library/utils/softDeleteFile";

/**
 * What happens after the transaction of a new sheet: the listeners are told
 * first, and only then the old `files` row gets a soft delete. `GET
 * /files/:id` answers 404 for a deleted file, and a client that still draws
 * the old sheet needs the event to swap before that. A failure to delete is
 * logged and does not undo the save.
 */
export const settleSheetChange = async (
    userId: string,
    avatarSheetFileId: string | null,
    previousFileId: string | null
): Promise<void> => {
    await publishAvatarSheetChanged({ userId, avatarSheetFileId });
    if (previousFileId === null) return;
    try {
        await softDeleteFile(previousFileId);
    } catch (error) {
        console.error(error);
    }
};
