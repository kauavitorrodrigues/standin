import { useEffect, useRef, useState } from "react";
import {
    clearPreferredDeviceId,
    getDeviceEnabledPreference,
    getPreferredDeviceId,
    subscribeToDeviceEnabledPreference,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";
import {
    classifyMediaError,
    isOverconstrainedError,
} from "@/features/media-devices/lib/classifyMediaError";
import { LOCAL_AUDIO_STREAM_ERRORS } from "@/features/media-devices/consts/audioError";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { LOCAL_CAMERA_CONSTRAINTS } from "@/features/media-devices/consts/videoConstraints";

// Camera counterpart of useLocalAudioStream. The device is only opened
// while the camera toggle is on, and released the moment it is turned off,
// so the camera light never stays on for a stream nobody is sending.
export function useLocalCameraStream() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    // The stream also lives in a ref so the cleanup can stop its tracks
    // directly. Doing it inside a setState updater is not safe: updaters must
    // be pure, and an unmount with an acquisition still pending never runs
    // them, which would leave the camera light on.
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<LocalAudioStreamError | null>(null);
    const [enabled, setEnabled] = useState(() =>
        getDeviceEnabledPreference("camera")
    );
    const [deviceId, setDeviceId] = useState(() =>
        getPreferredDeviceId("camera")
    );

    useEffect(() => subscribeToDeviceEnabledPreference("camera", setEnabled), []);
    useEffect(() => subscribeToPreferredDeviceId("camera", setDeviceId), []);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        const releaseStream = () => {
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };

        // Same stale-preference recovery as the microphone: an unplugged
        // device would otherwise make every future attempt fail with
        // OverconstrainedError.
        const acquireStream = (): Promise<MediaStream> =>
            navigator.mediaDevices
                .getUserMedia({
                    video: {
                        ...LOCAL_CAMERA_CONSTRAINTS,
                        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
                    },
                })
                .catch((err: unknown) => {
                    if (!deviceId || !isOverconstrainedError(err)) throw err;

                    clearPreferredDeviceId("camera");
                    return navigator.mediaDevices.getUserMedia({
                        video: LOCAL_CAMERA_CONSTRAINTS,
                    });
                });

        acquireStream()
            .then((mediaStream) => {
                if (cancelled) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = mediaStream;
                // Unplugging the webcam, or the OS revoking access, ends the
                // track without the toggle being touched. Without this the
                // button would stay "on" while peers received a frozen frame.
                mediaStream.getVideoTracks()[0]?.addEventListener(
                    "ended",
                    () => {
                        if (streamRef.current !== mediaStream) return;
                        releaseStream();
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
            releaseStream();
            setStream(null);
        };
    }, [enabled, deviceId]);

    return { stream: enabled ? stream : null, error, enabled };
}
