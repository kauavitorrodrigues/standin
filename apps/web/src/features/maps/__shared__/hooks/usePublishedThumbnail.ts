import { useCallback } from "react";
import type { PublishResult } from "@standin/contracts";
import { saveMapThumbnail } from "@/features/maps/__shared__/utils/saveMapThumbnail";
import type { EditorThumbnailTarget } from "@/features/editor/types/thumbnail";

type UsePublishedThumbnailInput = {
    thumbnail: EditorThumbnailTarget | undefined;
    capture: () => Promise<Blob>;
    // The handler of the page, called first, whatever happens to the photo.
    onPublished?: (result: PublishResult) => void;
};

/**
 * Returns the handler for a publish that worked. It runs the handler of the
 * page and then, when the editor has a photo target, captures the published
 * map again and sends it, whether or not the photo was missing. The draft was
 * already rebased, so the capture waits for the scene to settle on the new
 * model. A failure of the photo is logged by `saveMapThumbnail` and never
 * reaches the editor or the publish.
 */
export const usePublishedThumbnail = ({
    thumbnail,
    capture,
    onPublished,
}: UsePublishedThumbnailInput) => {
    const save = thumbnail?.save;

    return useCallback(
        (result: PublishResult) => {
            onPublished?.(result);
            if (!save) return;
            void saveMapThumbnail(capture, save);
        },
        [save, capture, onPublished]
    );
};
