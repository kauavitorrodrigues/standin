export const SOUNDBOARD_CLIP_SCOPES = {
    ORGANIZATION: "ORGANIZATION",
    DEFAULT: "DEFAULT",
} as const;

export type SoundboardClipScope =
    (typeof SOUNDBOARD_CLIP_SCOPES)[keyof typeof SOUNDBOARD_CLIP_SCOPES];
