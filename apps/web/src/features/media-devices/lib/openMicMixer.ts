import { createMixerContext } from "@/features/media-devices/lib/createMixerContext";
import {
    createMicMixer,
    keepContextRunning,
} from "@/features/media-devices/lib/micMixer";
import type { OpenedMixer } from "@/features/media-devices/types/openedMixer";

const noop = () => undefined;

// The microphone published as it is, with mute and the proximity gate on its
// own track. Clips cannot be mixed in, but the voice keeps working.
const createPlainMixer = (micStream: MediaStream): OpenedMixer => {
    let micEnabled = true;
    let publishEnabled = true;
    const apply = () =>
        micStream
            .getAudioTracks()
            .forEach((track) => (track.enabled = micEnabled && publishEnabled));

    return {
        stopWatching: noop,
        mixer: {
            canMixClips: false,
            stream: micStream,
            setMicEnabled: (enabled) => {
                micEnabled = enabled;
                apply();
            },
            setPublishEnabled: (enabled) => {
                publishEnabled = enabled;
                apply();
            },
            playClip: noop,
            stopClip: noop,
            stopAllClips: noop,
            resume: noop,
            dispose: () =>
                micStream.getTracks().forEach((track) => track.stop()),
        },
    };
};

/**
 * Builds the mixing graph around the microphone. When the browser cannot
 * (no AudioContext, or the graph throws) the plain microphone is published
 * instead, so a soundboard problem never costs the person their voice.
 */
export const openMicMixer = (micStream: MediaStream): OpenedMixer => {
    let context: AudioContext | null = null;
    try {
        context = createMixerContext(micStream);
        const stopWatching = keepContextRunning(context);
        return { mixer: createMicMixer(context, micStream), stopWatching };
    } catch (error) {
        console.error(error);
        void context?.close().catch(noop);
        return createPlainMixer(micStream);
    }
};
