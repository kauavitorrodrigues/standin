import {
    CAMERA_FRAME_RATE,
    CAMERA_RESOLUTIONS,
    type CameraResolution,
} from "@/features/media-devices/consts/videoSettings";

export const getCameraConstraints = (
    resolution: CameraResolution
): MediaTrackConstraints => ({
    width: { ideal: CAMERA_RESOLUTIONS[resolution].width },
    height: { ideal: CAMERA_RESOLUTIONS[resolution].height },
    frameRate: { ideal: CAMERA_FRAME_RATE },
});
