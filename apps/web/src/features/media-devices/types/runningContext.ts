// What keepContextRunning needs from a context.
export type RunningContext = Pick<
    AudioContext,
    "state" | "resume" | "addEventListener" | "removeEventListener"
>;
