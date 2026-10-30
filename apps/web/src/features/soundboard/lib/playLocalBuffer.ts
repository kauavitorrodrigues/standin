import { clampVolume } from "../utils/clampVolume";
import type { LocalPlayback } from "../types/playback";

/**
 * Plays a buffer to the speakers of this person only, at the volume given. It
 * needs no microphone: the manager uses it where nothing is sent to a call.
 * Returns what stops it. A stop by hand does not report the end.
 */
export const playLocalBuffer = (
    context: AudioContext,
    { buffer, volume, onEnded }: LocalPlayback
): (() => void) => {
    void context.resume().catch(() => undefined);
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = clampVolume(volume);
    source.connect(gain);
    gain.connect(context.destination);

    const release = () => {
        source.disconnect();
        gain.disconnect();
    };
    source.onended = () => {
        release();
        onEnded?.();
    };
    source.start();

    return () => {
        source.onended = null;
        source.stop();
        release();
    };
};
