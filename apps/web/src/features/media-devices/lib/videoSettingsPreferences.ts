import {
    CAMERA_RESOLUTION_IDS,
    CAMERA_RESOLUTION_STORAGE_KEY,
    DEFAULT_CAMERA_RESOLUTION,
    DEFAULT_MIRROR_SELF_CAMERA,
    MIRROR_SELF_CAMERA_STORAGE_KEY,
    type CameraResolution,
} from "@/features/media-devices/consts/videoSettings";
import { createLocalPreference } from "@/lib/createLocalPreference";

const isCameraResolution = (stored: unknown): stored is CameraResolution =>
    CAMERA_RESOLUTION_IDS.some((id) => id === stored);

export const cameraResolutionPreference = createLocalPreference({
    key: CAMERA_RESOLUTION_STORAGE_KEY,
    fallback: DEFAULT_CAMERA_RESOLUTION,
    parse: (stored) =>
        isCameraResolution(stored) ? stored : DEFAULT_CAMERA_RESOLUTION,
});

export const mirrorSelfCameraPreference = createLocalPreference({
    key: MIRROR_SELF_CAMERA_STORAGE_KEY,
    fallback: DEFAULT_MIRROR_SELF_CAMERA,
    parse: (stored) =>
        typeof stored === "boolean" ? stored : DEFAULT_MIRROR_SELF_CAMERA,
});
