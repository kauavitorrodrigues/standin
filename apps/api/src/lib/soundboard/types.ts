// What a person is playing right now.
export type ActivePlay = {
    playId: string;
    spaceId: string;
    userId: string;
    clipId: string;
};

// The clock and the timers, injected so the rules are testable without waiting.
export type PlaybackClock = {
    now: () => number;
    setTimer: (run: () => void, delayMs: number) => unknown;
    clearTimer: (handle: unknown) => void;
    newId: () => string;
};

// An active play with the timer that ends it.
export type PlaybackEntry = ActivePlay & { timer: unknown };

export type PlaybackFailure = {
    ok: false;
    code: string;
    retryAfterMs?: number;
};

export type PlaybackStart = {
    spaceId: string;
    socketId: string;
    userId: string;
    clipId: string;
    durationMs: number;
};

// Called when a clip ends by itself, after its duration.
export type PlaybackEndedListener = (
    socketId: string,
    play: ActivePlay
) => void;
