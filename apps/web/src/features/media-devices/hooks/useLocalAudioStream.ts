import { useCallback, useEffect, useRef, useState } from "react";
import {
    getDeviceEnabledPreference,
    getPreferredDeviceId,
    subscribeToMicrophoneEnabledPreference,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";
import { classifyMediaError } from "@/features/media-devices/lib/classifyMediaError";
import { acquireMicStream } from "@/features/media-devices/lib/acquireMicStream";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { useAudioProcessingPreference } from "@/features/media-devices/hooks/useAudioProcessingPreference";
import { openMicMixer } from "@/features/media-devices/lib/openMicMixer";
import type { ClipStart } from "@/features/media-devices/types/clipStart";
import type { MicMixer } from "@/features/media-devices/types/micMixer";

export function useLocalAudioStream() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<LocalAudioStreamError | null>(null);

    // The graph behind the published stream. The stream returned below is the
    // output of this mixer, not the raw microphone, so a clip can be mixed in.
    const mixerRef = useRef<MicMixer | null>(null);
    const micEnabledRef = useRef(true);
    // A second, independent gate on top of the mic mute toggle above (see
    // setProximityGate): the outgoing track is only actually live when
    // both are true. Defaults to true so a caller that never calls
    // setProximityGate (this hook has no game-specific knowledge of its
    // own) doesn't unexpectedly silence the mic.
    const proximityGateRef = useRef(true);

    // Mute acts on the microphone only, so a clip still goes out while muted.
    // The proximity gate cuts the whole published track, clip included.
    const applyEnabled = useCallback(() => {
        mixerRef.current?.setMicEnabled(micEnabledRef.current);
        mixerRef.current?.setPublishEnabled(proximityGateRef.current);
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

    // Same for the processing switches in the settings: a new stream is
    // acquired with the new constraints.
    const audioProcessing = useAudioProcessingPreference();

    useEffect(() => {
        let cancelled = false;
        let unsubscribe: (() => void) | null = null;
        let stopWatchingContext: (() => void) | null = null;

        acquireMicStream(deviceId, audioProcessing)
            .then((mediaStream) => {
                if (cancelled) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const opened = openMicMixer(mediaStream);
                stopWatchingContext = opened.stopWatching;
                const { mixer } = opened;
                mixerRef.current = mixer;

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

                setStream(mixer.stream);
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
            stopWatchingContext?.();
            mixerRef.current?.dispose();
            mixerRef.current = null;
        };
    }, [deviceId, audioProcessing, applyEnabled]);

    // Called from a click, which is the gesture a suspended context needs.
    // It answers false when there is no microphone graph to play into.
    const playClip = useCallback((start: ClipStart): boolean => {
        const mixer = mixerRef.current;
        if (!mixer?.canMixClips) return false;
        mixer.playClip(start);
        return true;
    }, []);
    const stopClip = useCallback(
        (playId: string) => mixerRef.current?.stopClip(playId),
        []
    );
    const stopAllClips = useCallback(
        () => mixerRef.current?.stopAllClips(),
        []
    );

    return {
        stream,
        error,
        setProximityGate,
        playClip,
        stopClip,
        stopAllClips,
    };
}
