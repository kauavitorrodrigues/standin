// What the server tells the space when a person starts a clip. The audio itself
// rides the audio producer of that person, so this is only state.
export type SoundboardStarted = {
    // One id per play, so the same clip can overlap itself and each play is
    // stopped on its own.
    playId: string;
    userId: string;
    clipId: string;
    name: string;
    durationMs: number;
};

export type SoundboardStopped = {
    playId: string;
    userId: string;
    clipId: string;
};

export type SoundboardPlayAck =
    | { ok: true; clip: SoundboardStarted }
    | { ok: false; code: string; retryAfterMs?: number };

export type SoundboardStopAck = { ok: true } | { ok: false; code: string };
