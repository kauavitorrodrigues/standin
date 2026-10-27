export const MEDIA_SOURCES = {
    MIC: "mic",
    CAMERA: "camera",
    SCREEN: "screen",
    SCREEN_AUDIO: "screen-audio",
} as const;

export type MediaSource = (typeof MEDIA_SOURCES)[keyof typeof MEDIA_SOURCES];

export const MEDIA_TRANSPORT_DIRECTIONS = {
    SEND: "send",
    RECV: "recv",
} as const;

export type MediaTransportDirection =
    (typeof MEDIA_TRANSPORT_DIRECTIONS)[keyof typeof MEDIA_TRANSPORT_DIRECTIONS];

export const MEDIA_KINDS = {
    AUDIO: "audio",
    VIDEO: "video",
} as const;

export type MediaKind = (typeof MEDIA_KINDS)[keyof typeof MEDIA_KINDS];

// The kind of track each source produces. Fixed, so a client cannot announce a
// camera as audio.
export const MEDIA_SOURCE_KINDS: Record<MediaSource, MediaKind> = {
    [MEDIA_SOURCES.MIC]: MEDIA_KINDS.AUDIO,
    [MEDIA_SOURCES.CAMERA]: MEDIA_KINDS.VIDEO,
    [MEDIA_SOURCES.SCREEN]: MEDIA_KINDS.VIDEO,
    [MEDIA_SOURCES.SCREEN_AUDIO]: MEDIA_KINDS.AUDIO,
};
