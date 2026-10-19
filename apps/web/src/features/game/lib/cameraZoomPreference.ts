import { CAMERA_ZOOM_STORAGE_KEY } from "@/features/game/consts/camera-zoom-storage";
import { createLocalPreference } from "@/lib/createLocalPreference";

const parseCameraZoom = (stored: unknown): number | null =>
    typeof stored === "number" && Number.isFinite(stored) && stored > 0
        ? stored
        : null;

// null until the player zooms for the first time, then the game boots with the
// default zoom.
export const cameraZoomPreference = createLocalPreference<number | null>({
    key: CAMERA_ZOOM_STORAGE_KEY,
    fallback: null,
    parse: parseCameraZoom,
});
