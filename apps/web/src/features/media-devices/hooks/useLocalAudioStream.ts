import { useCallback, useEffect, useRef, useState } from "react";
import {
    clearPreferredDeviceId,
    getDeviceEnabledPreference,
    getPreferredDeviceId,
    subscribeToMicrophoneEnabledPreference,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";
import {
    classifyMediaError,
    isOverconstrainedError,
} from "@/features/media-devices/lib/classifyMediaError";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { LOCAL_AUDIO_PROCESSING_CONSTRAINTS } from "@/features/media-devices/consts/audioConstraints";

export function useLocalAudioStream() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<LocalAudioStreamError | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const micEnabledRef = useRef(true);
    // A second, independent gate on top of the mic mute toggle above (see
    // setProximityGate): the outgoing track is only actually live when
    // both are true. Defaults to true so a caller that never calls
    // setProximityGate (this hook has no game-specific knowledge of its
    // own) doesn't unexpectedly silence the mic.
    const proximityGateRef = useRef(true);

    const applyEnabled = useCallback(() => {
        const enabled = micEnabledRef.current && proximityGateRef.current;
        streamRef.current
            ?.getAudioTracks()
            .forEach((track) => (track.enabled = enabled));
    }, []);

    const setProximityGate = useCallback(
        (allowed: boolean) => {
            proximityGateRef.current = allowed;
            applyEnabled();
        },
        [applyEnabled]
    );

    // Re-read live (not just at mount) so switching microphones in the
    // device picker re-acquires a stream from the newly selected device
    // instead of silently continuing to stream from the old one.
    const [deviceId, setDeviceId] = useState(() =>
        getPreferredDeviceId("microphone")
    );

    useEffect(
        () => subscribeToPreferredDeviceId("microphone", setDeviceId),
        []
    );

    useEffect(() => {
        let cancelled = false;
        let unsubscribe: (() => void) | null = null;

        // A persisted deviceId preference can go stale (the device was
        // unplugged, or permissions/available devices changed elsewhere) -
        // without a fallback, `{ exact: deviceId }` makes getUserMedia
        // reject with OverconstrainedError on every future mount even
        // though a usable microphone exists. One retry against any mic,
        // and drop the bad preference so this doesn't repeat next time.
        const acquireStream = (): Promise<MediaStream> =>
            navigator.mediaDevices
                .getUserMedia({
                    audio: {
                        ...LOCAL_AUDIO_PROCESSING_CONSTRAINTS,
                        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
                    },
                })
                .catch((err: unknown) => {
                    if (!deviceId || !isOverconstrainedError(err)) throw err;

                    clearPreferredDeviceId("microphone");
                    return navigator.mediaDevices.getUserMedia({
                        audio: LOCAL_AUDIO_PROCESSING_CONSTRAINTS,
                    });
                });

        acquireStream()
            .then((mediaStream) => {
                if (cancelled) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = mediaStream;

                // The mic mute toggle lives in a different hook instance
                // (useMediaDeviceControl); this keeps the actual outgoing
                // track in sync with it instead of always streaming live
                // audio regardless of the UI's mute state.
                micEnabledRef.current =
                    getDeviceEnabledPreference("microphone");
                applyEnabled();
                unsubscribe = subscribeToMicrophoneEnabledPreference(
                    (enabled) => {
                        micEnabledRef.current = enabled;
                        applyEnabled();
                    }
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
            unsubscribe?.();
            streamRef.current?.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        };
    }, [deviceId, applyEnabled]);

    return { stream, error, setProximityGate };
}
