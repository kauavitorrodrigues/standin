import {
    clearPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";
import { isOverconstrainedError } from "@/features/media-devices/lib/classifyMediaError";
import { getCameraConstraints } from "@/features/media-devices/lib/cameraConstraints";
import type { CameraResolution } from "@/features/media-devices/consts/videoSettings";

// Same stale-preference recovery as the microphone: an unplugged device
// would otherwise make every future attempt fail with OverconstrainedError.
export const acquireCameraStream = (
    deviceId: string | null,
    resolution: CameraResolution
): Promise<MediaStream> => {
    const constraints = getCameraConstraints(resolution);

    return navigator.mediaDevices
        .getUserMedia({
            video: {
                ...constraints,
                ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
            },
        })
        .catch((err: unknown) => {
            if (!deviceId || !isOverconstrainedError(err)) throw err;

            clearPreferredDeviceId("camera");
            return navigator.mediaDevices.getUserMedia({
                video: constraints,
            });
        });
};

