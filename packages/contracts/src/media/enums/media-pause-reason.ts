// Why the server holds a video back from a person. The client shows a short
// notice on the tile for each one, instead of a frozen picture.
export const MEDIA_PAUSE_REASONS = {
    // The machine of the receiver asked for less, so only the most important
    // video is played and the others wait.
    CLIENT_LIMIT: "client-limit",
    // The media server is short of CPU and holds back the videos that matter
    // least. Audio is never held back for this.
    SERVER_LIMIT: "server-limit",
    // The receiver chose to hide the video of this person.
    USER_HIDDEN: "user-hidden",
    // A rule of the space lowered the video of this person to almost nothing.
    SPACE_RULE: "space-rule",
} as const;

export type MediaPauseReason =
    (typeof MEDIA_PAUSE_REASONS)[keyof typeof MEDIA_PAUSE_REASONS];
