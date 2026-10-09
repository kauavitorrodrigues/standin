import { clearPreferredDeviceId } from "@/features/media-devices/lib/mediaDevicePreferences";
import { isOverconstrainedError } from "@/features/media-devices/lib/classifyMediaError";
import type { AudioProcessingSettings } from "@/features/media-devices/consts/audioSettings";

// A persisted deviceId preference can go stale (the device was unplugged, or
// the available devices changed). Without a fallback, `{ exact: deviceId }`
// makes getUserMedia reject with OverconstrainedError on every future call
// even though a usable microphone exists. One retry against any mic, and the
// bad preference is dropped so this does not repeat next time.
export const acquireMicStream = (
    deviceId: string | null,
    processing: AudioProcessingSettings
): Promise<MediaStream> =>
    navigator.mediaDevices
        .getUserMedia({
            audio: {
                ...processing,
                ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
            },
        })
        .catch((err: unknown) => {
            if (!deviceId || !isOverconstrainedError(err)) throw err;

            clearPreferredDeviceId("microphone");
            return navigator.mediaDevices.getUserMedia({ audio: processing });
        });
