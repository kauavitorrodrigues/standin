export const SoundboardEvents = {
    // Client to server, with an ack.
    PLAY: "soundboard:play",
    STOP: "soundboard:stop",
    // Server to the space.
    STARTED: "soundboard:started",
    STOPPED: "soundboard:stopped",
} as const;

export type SoundboardEvent =
    (typeof SoundboardEvents)[keyof typeof SoundboardEvents];
