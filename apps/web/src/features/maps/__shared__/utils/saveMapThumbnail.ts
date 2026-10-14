import { THUMBNAIL_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import type { EditorThumbnailTarget } from "@/features/maps/__shared__/types/thumbnail";

// Captures the map and hands the photo to `save`. Any failure is logged and
// swallowed: the photo is a bonus and must never get in the way of editing.
export const saveMapThumbnail = async (
    capture: () => Promise<Blob>,
    save: EditorThumbnailTarget["save"]
): Promise<void> => {
    let blob: Blob;
    try {
        blob = await capture();
    } catch (cause) {
        console.warn(THUMBNAIL_MESSAGES.CAPTURE_FAILED, cause);
        return;
    }

    try {
        await save(blob);
    } catch (cause) {
        console.warn(THUMBNAIL_MESSAGES.SAVE_FAILED, cause);
    }
};
