import type { MicMixer } from "./micMixer";

export type OpenedMixer = {
    mixer: MicMixer;
    // Removes the listeners that keep the context running.
    stopWatching: () => void;
};
