export const SOUND_EFFECT_STATE = {
    INITIALIZED: "initialized",
    STARTING_PLAY: "starting-play",
    PLAYING: "playing",
    PAUSED: "paused",
    ERRORED: "errored",
    DESTROYED: "destroyed",
} as const;

export type SoundEffectState =
    (typeof SOUND_EFFECT_STATE)[keyof typeof SOUND_EFFECT_STATE];
