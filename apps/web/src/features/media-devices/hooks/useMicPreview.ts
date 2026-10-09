import { useEffect, useState } from "react";
import type { LocalAudioStreamError } from "@/features/media-devices/consts/audioError";
import { useAudioLoopback } from "@/features/media-devices/hooks/useAudioLoopback";
import { useAudioProcessingPreference } from "@/features/media-devices/hooks/useAudioProcessingPreference";
import { acquireMicStream } from "@/features/media-devices/lib/acquireMicStream";
import { classifyMediaError } from "@/features/media-devices/lib/classifyMediaError";
import {
    getPreferredDeviceId,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";

// A microphone test for the settings. It opens its own stream with the
// device and processing chosen in the settings, so what is tested is what
// the others would hear. Hearing yourself is a separate, opt-in step.
export const useMicPreview = () => {
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<LocalAudioStreamError | null>(null);
    const [deviceId, setDeviceId] = useState(() =>
        getPreferredDeviceId("microphone")
    );
    const processing = useAudioProcessingPreference();

    useEffect(() => subscribeToPreferredDeviceId("microphone", setDeviceId), []);

    useEffect(() => {
        if (!isPreviewing) return;

        let cancelled = false;
        let acquired: MediaStream | null = null;

        acquireMicStream(deviceId, processing)
            .then((mediaStream) => {
                if (cancelled) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                acquired = mediaStream;
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
    }, [isPreviewing, deviceId, processing]);

    useAudioLoopback(stream, isListening);

    return {
        stream,
        error,
        isPreviewing,
        isListening,
        setIsListening,
        // Like Discord, the test starts by playing the voice back.
        start: () => {
            setIsPreviewing(true);
            setIsListening(true);
        },
        stop: () => {
            setIsPreviewing(false);
            setIsListening(false);
            setError(null);
        },
    };
};
