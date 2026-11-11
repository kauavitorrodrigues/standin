import {
    MUSIC_NOTE,
    MUSIC_NOTE_COLORS,
} from "@/features/game/consts/musicNotes";
import type { MusicNoteState } from "@/features/game/types/musicNotes";
import { randomBetween } from "@/features/game/utils/randomBetween";

type Params = {
    x: number;
    y: number;
    random: () => number;
};

// A new note at the point, with its own rise, sway and color.
export const buildMusicNote = ({ x, y, random }: Params): MusicNoteState => {
    const originX =
        x +
        randomBetween(
            -MUSIC_NOTE.SPAWN_SPREAD_PX,
            MUSIC_NOTE.SPAWN_SPREAD_PX,
            random
        );

    return {
        originX,
        x: originX,
        y,
        riseSpeed: randomBetween(
            MUSIC_NOTE.RISE_SPEED_MIN,
            MUSIC_NOTE.RISE_SPEED_MAX,
            random
        ),
        swayPhase: randomBetween(0, Math.PI * 2, random),
        swaySpeed: randomBetween(
            MUSIC_NOTE.SWAY_RAD_PER_SECOND_MIN,
            MUSIC_NOTE.SWAY_RAD_PER_SECOND_MAX,
            random
        ),
        swayAmplitude: randomBetween(
            MUSIC_NOTE.SWAY_AMPLITUDE_MIN,
            MUSIC_NOTE.SWAY_AMPLITUDE_MAX,
            random
        ),
        rotation: 0,
        colorIndex: Math.floor(random() * MUSIC_NOTE_COLORS.length),
        ageMs: 0,
        lifeMs: randomBetween(
            MUSIC_NOTE.LIFE_MIN_MS,
            MUSIC_NOTE.LIFE_MAX_MS,
            random
        ),
    };
};
