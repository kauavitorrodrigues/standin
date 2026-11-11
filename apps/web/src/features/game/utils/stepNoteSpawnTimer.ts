import { MUSIC_NOTE } from "@/features/game/consts/musicNotes";
import type { SpawnTimerStep } from "@/features/game/types/musicNotes";
import { randomBetween } from "@/features/game/utils/randomBetween";

/** The wait until the next note: the base interval with a jitter. */
export const nextNoteDelay = (random: () => number): number =>
    randomBetween(
        MUSIC_NOTE.SPAWN_INTERVAL_MIN_MS,
        MUSIC_NOTE.SPAWN_INTERVAL_MAX_MS,
        random
    );

/** The wait before the first note of an avatar, short so the music shows. */
export const nextFirstNoteDelay = (random: () => number): number =>
    randomBetween(
        MUSIC_NOTE.FIRST_NOTE_DELAY_MIN_MS,
        MUSIC_NOTE.FIRST_NOTE_DELAY_MAX_MS,
        random
    );

/**
 * One frame of the spawn timer of an avatar. When the time runs out a note is
 * due and the timer starts again with a new wait, so a long frame never
 * throws more than one note.
 */
export const stepNoteSpawnTimer = (
    remainingMs: number,
    delta: number,
    random: () => number
): SpawnTimerStep => {
    const left = remainingMs - delta;
    if (left > 0) return { remainingMs: left, shouldSpawn: false };

    return { remainingMs: nextNoteDelay(random), shouldSpawn: true };
};
