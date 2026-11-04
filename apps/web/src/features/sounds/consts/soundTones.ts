import type { ChimeNote } from "@/features/sounds/types/chime";

// Longer and lower than the notification, so the two are easy to tell apart
// when someone is checking their speakers.
export const SPEAKER_TEST_SOUND = {
    frequencyHz: 523,
    durationSeconds: 0.7,
} as const;

// How a chime note starts and how loud its octave is, so it rings like a bell
// and not like a beep.
export const CHIME_ATTACK_SECONDS = 0.01;
export const CHIME_OVERTONE_GAIN = 0.25;

// Two notes going up, close together: someone asking for the floor. Lighter
// than the notification so a room of hands does not tire anyone.
export const HAND_RAISE_SOUND: readonly ChimeNote[] = [
    { frequencyHz: 659, startSeconds: 0, durationSeconds: 0.22, gain: 0.5 },
    { frequencyHz: 988, startSeconds: 0.11, durationSeconds: 0.38, gain: 0.45 },
];
