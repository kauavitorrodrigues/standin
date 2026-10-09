export const CAMERA_RESOLUTIONS = {
    "360p": { width: 640, height: 360 },
    "480p": { width: 854, height: 480 },
    "720p": { width: 1280, height: 720 },
} as const;

export type CameraResolution = keyof typeof CAMERA_RESOLUTIONS;

export const CAMERA_RESOLUTION_IDS = Object.keys(
    CAMERA_RESOLUTIONS
) as CameraResolution[];

export const CAMERA_FRAME_RATE = 24;

export const DEFAULT_CAMERA_RESOLUTION: CameraResolution = "360p";
export const CAMERA_RESOLUTION_STORAGE_KEY = "media_camera_resolution";

// Only how your own tile is shown to you. What peers receive is never
// mirrored.
export const DEFAULT_MIRROR_SELF_CAMERA = true;
export const MIRROR_SELF_CAMERA_STORAGE_KEY = "media_mirror_self_camera";
