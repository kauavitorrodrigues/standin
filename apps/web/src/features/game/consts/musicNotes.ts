import { EMOTE_DEPTH } from "@/features/game/consts/emote";

// The notes use the colors of the confetti, so both read as the same paper.
export { CONFETTI_COLORS as MUSIC_NOTE_COLORS } from "@/features/game/consts/confetti";

// Small paper notes that rise from the avatar of a person while their music
// plays. Speeds are px per second, in world px.
export const MUSIC_NOTE = {
    TEXTURE_KEY_PREFIX: "music-note-",
    WIDTH: 8,
    HEIGHT: 12,
    // Time between two notes of one avatar: about one every 5 seconds, so the
    // music is a hint over the avatar and not a stream. The jitter keeps
    // avatars that started together from sending their notes in step.
    SPAWN_INTERVAL_MIN_MS: 4000,
    SPAWN_INTERVAL_MAX_MS: 6000,
    // The first note of an avatar comes soon, so the music is seen as it
    // starts, and the next ones follow the rhythm above.
    FIRST_NOTE_DELAY_MIN_MS: 600,
    FIRST_NOTE_DELAY_MAX_MS: 2400,
    RISE_SPEED_MIN: 22,
    RISE_SPEED_MAX: 38,
    LIFE_MIN_MS: 1800,
    LIFE_MAX_MS: 2600,
    // The sway left and right as the note rises, and the tilt that goes with it.
    SWAY_AMPLITUDE_MIN: 4,
    SWAY_AMPLITUDE_MAX: 9,
    SWAY_RAD_PER_SECOND_MIN: 1.6,
    SWAY_RAD_PER_SECOND_MAX: 3,
    TILT_RAD: 0.35,
    // The note fades in at the start and out at the end of its life.
    FADE_IN_SHARE: 0.15,
    FADE_OUT_START_SHARE: 0.55,
    // Where a note starts, as a share of the visible body from the feet. Above
    // the head, so it does not cover the name tag.
    SPAWN_BODY_SHARE: 1,
    // Sideways spread of the start point around the avatar.
    SPAWN_SPREAD_PX: 10,
    // Notes alive at once, a budget of their own apart from the emojis and the
    // confetti.
    MAX_ACTIVE: 24,
    DEPTH: EMOTE_DEPTH,
} as const;
