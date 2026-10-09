import { useEffect, useState } from "react";
import { LOCAL_AUDIO_STREAM_ERRORS } from "@/features/media-devices/consts/audioError";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { useCameraResolutionPreference } from "@/features/media-devices/hooks/useCameraResolutionPreference";
import { acquireCameraStream } from "@/features/media-devices/lib/acquireCameraStream";
import { cameraPreviewLock } from "@/features/media-devices/lib/cameraPreviewLock";
import { classifyMediaError } from "@/features/media-devices/lib/classifyMediaError";
import {
    getPreferredDeviceId,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";

// A camera test for the settings. While it runs it is the only user of the
// device (see cameraPreviewLock), and it follows the device and resolution
// chosen in the settings.
export const useCameraPreview = () => {
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<LocalAudioStreamError | null>(null);
    const [deviceId, setDeviceId] = useState(() =>
        getPreferredDeviceId("camera")
    );
    const resolution = useCameraResolutionPreference();

    useEffect(() => subscribeToPreferredDeviceId("camera", setDeviceId), []);

    // Separate from the acquisition below so that changing the device
    // restarts the preview without handing the camera back for a moment.
    useEffect(() => {
        if (!isPreviewing) return;

        cameraPreviewLock.acquire();
        return () => cameraPreviewLock.release();
    }, [isPreviewing]);

    useEffect(() => {
        if (!isPreviewing) return;

        let cancelled = false;
        let acquired: MediaStream | null = null;

        acquireCameraStream(deviceId, resolution)
            .then((mediaStream) => {
                if (cancelled) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                acquired = mediaStream;
                // Unplugging the camera ends the track by itself.
                mediaStream.getVideoTracks()[0]?.addEventListener(
                    "ended",
                    () => {
                        if (acquired !== mediaStream) return;
                        setStream(null);
                        setError(LOCAL_AUDIO_STREAM_ERRORS.UNKNOWN);
                    },
                    { once: true }
                );
                setStream(mediaStream);
                setError(null);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setStream(null);
                setError(classifyMediaError(err));
            });

        return () => {
            cancelled = true;
            acquired?.getTracks().forEach((track) => track.stop());
            setStream(null);
        };
    }, [isPreviewing, deviceId, resolution]);

    return {
        stream,
        error,
        isPreviewing,
        start: () => setIsPreviewing(true),
        stop: () => {
            setIsPreviewing(false);
            setError(null);
        },
    };
};
