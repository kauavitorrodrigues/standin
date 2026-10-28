import { THUMBNAIL_MESSAGES } from "@/features/editor/consts/messages";
import type { EditorThumbnailTarget } from "@/features/editor/types/thumbnail";
import type { ThumbnailMemory } from "@/features/maps/__shared__/types/thumbnailMemory";
import { hashBlob } from "./hashBlob";

type Captured = { blob: Blob } | { failure: unknown };

// A photo that cannot be fingerprinted counts as new: sending it again costs a
// request, dropping it could leave a stale card.
const fingerprint = (blob: Blob): Promise<string | null> =>
    hashBlob(blob).catch(() => null);

const takePhoto = async (capture: () => Promise<Blob>): Promise<Captured> => {
    try {
        return { blob: await capture() };
    } catch (failure) {
        return { failure };
    }
};

// Captures the map and hands the photo to `save`. Any failure is logged and
// swallowed: the photo is a bonus and must never get in the way of editing.
//
// With `lastSaved`, a photo identical to the last one saved is not sent, which
// is what a publish that changed nothing visible (a zone, a revert) makes. The
// memory is updated only once the save worked, so a failed one is retried.
// The capture starts at once, since it shows the map as it is now, but the
// saves go one at a time in the order of the calls, so the memory always ends
// with the photo the server got last.
export const saveMapThumbnail = (
    capture: () => Promise<Blob>,
    save: EditorThumbnailTarget["save"],
    lastSaved?: ThumbnailMemory
): Promise<void> => {
    const captured = takePhoto(capture);

    const saveIt = async (): Promise<void> => {
        const photo = await captured;
        if ("failure" in photo) {
            console.warn(THUMBNAIL_MESSAGES.CAPTURE_FAILED, photo.failure);
            return;
        }

        const hash = lastSaved ? await fingerprint(photo.blob) : null;
        if (hash !== null && hash === lastSaved?.hash) return;

        try {
            await save(photo.blob);
            if (lastSaved) lastSaved.hash = hash;
        } catch (cause) {
            console.warn(THUMBNAIL_MESSAGES.SAVE_FAILED, cause);
        }
    };

    if (!lastSaved) return saveIt();

    const turn = lastSaved.queue.then(saveIt);
    lastSaved.queue = turn;
    return turn;
};
