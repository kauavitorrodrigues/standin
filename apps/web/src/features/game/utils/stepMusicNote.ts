import { MUSIC_NOTE } from "@/features/game/consts/musicNotes";
import type { MusicNoteState } from "@/features/game/types/musicNotes";

const MS_PER_SECOND = 1000;
const FULL_ALPHA = 1;

// One frame of a note, written into the note so the per-frame loop builds no
// objects. It rises at a steady pace and sways around its column.
export const advanceMusicNote = (
    note: MusicNoteState,
    delta: number
): MusicNoteState => {
    const seconds = delta / MS_PER_SECOND;
    note.ageMs += delta;
    note.y -= note.riseSpeed * seconds;
    note.swayPhase += note.swaySpeed * seconds;
    note.x = note.originX + Math.sin(note.swayPhase) * note.swayAmplitude;
    note.rotation = Math.cos(note.swayPhase) * MUSIC_NOTE.TILT_RAD;
    return note;
};

export const isMusicNoteDone = (note: MusicNoteState): boolean =>
    note.ageMs >= note.lifeMs;

// Fades in, stays, then fades out.
export const getMusicNoteAlpha = (note: MusicNoteState): number => {
    const share = note.ageMs / note.lifeMs;
    if (share < MUSIC_NOTE.FADE_IN_SHARE)
        return share / MUSIC_NOTE.FADE_IN_SHARE;
    if (share <= MUSIC_NOTE.FADE_OUT_START_SHARE) return FULL_ALPHA;

    const fading =
        (share - MUSIC_NOTE.FADE_OUT_START_SHARE) /
        (FULL_ALPHA - MUSIC_NOTE.FADE_OUT_START_SHARE);
    return Math.max(0, FULL_ALPHA - fading);
};
