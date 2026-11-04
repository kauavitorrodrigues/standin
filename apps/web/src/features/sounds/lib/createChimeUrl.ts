import {
    CHIME_ATTACK_SECONDS,
    CHIME_OVERTONE_GAIN,
} from "@/features/sounds/consts/soundTones";
import {
    encodeWavUrl,
    WAV_SAMPLE_RATE,
} from "@/features/sounds/lib/encodeWavUrl";
import type { ChimeNote } from "@/features/sounds/types/chime";

// How loud a note is at a moment of its own life: a quick rise so it does not
// click, then a smooth fall to silence.
const envelopeAt = (elapsed: number, duration: number): number => {
    const attack = Math.min(elapsed / CHIME_ATTACK_SECONDS, 1);
    const fade = (1 - elapsed / duration) ** 2;
    return attack * fade;
};

// A soft bell: each note is a sine with a quieter octave above it, and the
// notes can overlap. Returned as a blob URL.
export const createChimeUrl = (notes: readonly ChimeNote[]): string => {
    const totalSeconds = Math.max(
        ...notes.map((note) => note.startSeconds + note.durationSeconds)
    );

    const samples = new Float32Array(
        Math.round(WAV_SAMPLE_RATE * totalSeconds)
    );

    notes.forEach((note) => {
        const first = Math.round(note.startSeconds * WAV_SAMPLE_RATE);
        const count = Math.round(note.durationSeconds * WAV_SAMPLE_RATE);

        for (let index = 0; index < count; index++) {
            const elapsed = index / WAV_SAMPLE_RATE;
            const phase = 2 * Math.PI * note.frequencyHz * elapsed;
            const tone =
                Math.sin(phase) + Math.sin(phase * 2) * CHIME_OVERTONE_GAIN;
            samples[first + index] +=
                tone * envelopeAt(elapsed, note.durationSeconds) * note.gain;
        }
    });

    return encodeWavUrl(samples);
};
