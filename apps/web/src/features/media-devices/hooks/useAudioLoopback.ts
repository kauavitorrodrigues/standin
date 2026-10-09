import { useEffect } from "react";
import {
    getPreferredDeviceId,
    subscribeToPreferredDeviceId,
} from "@/features/media-devices/lib/mediaDevicePreferences";

type SinkableAudioElement = HTMLAudioElement & {
    setSinkId?: (deviceId: string) => Promise<void>;
};

// Plays the stream back through the chosen output device, so a person can
// hear themselves. Only for the tests in the settings: through speakers it
// feeds back into the microphone.
export const useAudioLoopback = (
    stream: MediaStream | null,
    enabled: boolean
) => {
    useEffect(() => {
        if (!stream || !enabled) return;

        const audio: SinkableAudioElement = new Audio();
        audio.srcObject = stream;

        const applySink = (deviceId: string | null) => {
            if (!deviceId || typeof audio.setSinkId !== "function") return;
            void audio.setSinkId(deviceId).catch(() => {});
        };
        applySink(getPreferredDeviceId("speaker"));
        const unsubscribe = subscribeToPreferredDeviceId("speaker", applySink);

        void audio.play().catch(() => {});

        return () => {
            unsubscribe();
            audio.pause();
            audio.srcObject = null;
        };
    }, [stream, enabled]);
};
