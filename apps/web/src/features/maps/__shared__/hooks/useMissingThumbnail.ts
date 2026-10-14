import { useEffect, useRef } from "react";
import { saveMapThumbnail } from "@/features/maps/__shared__/utils/saveMapThumbnail";
import type { EditorThumbnailTarget } from "@/features/maps/__shared__/types/thumbnail";

type UseMissingThumbnailInput = {
    thumbnail: EditorThumbnailTarget | undefined;
    // The scene is up and can be captured.
    ready: boolean;
    capture: () => Promise<Blob>;
};

/**
 * Captures the map and saves the photo once, when the scene is ready and the
 * map has none. The ref keeps it to one attempt per editor, through re-renders
 * and StrictMode, and also when the attempt fails.
 */
export const useMissingThumbnail = ({
    thumbnail,
    ready,
    capture,
}: UseMissingThumbnailInput) => {
    const attempted = useRef(false);
    const missing = thumbnail?.missing === true;
    const save = thumbnail?.save;

    useEffect(() => {
        if (!missing || !save || !ready || attempted.current) return;

        attempted.current = true;
        void saveMapThumbnail(capture, save);
    }, [missing, save, ready, capture]);
};
