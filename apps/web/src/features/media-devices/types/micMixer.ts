import type { ClipStart } from "./clipStart";

export type MicMixer = {
    // False for the plain microphone fallback, which cannot mix a clip.
    canMixClips: boolean;
    // What is published: the microphone plus the clips that are playing.
    stream: MediaStream;
    // Mute acts on the microphone only, so a clip still goes out.
    setMicEnabled: (enabled: boolean) => void;
    // Gates everything published, microphone and clip alike.
    setPublishEnabled: (enabled: boolean) => void;
    // Mixes the clip into the published stream, and plays it to the local
    // speakers too. It does not stop the others: plays overlap, each one
    // through its own gain, and each one ends on its own.
    playClip: (start: ClipStart) => void;
    // Stops one play, or all of them.
    stopClip: (playId: string) => void;
    stopAllClips: () => void;
    // Tries to start a suspended context, needs a user gesture on some browsers.
    resume: () => void;
    dispose: () => void;
};
