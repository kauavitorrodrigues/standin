const SECONDS_PER_MINUTE = 60;

/** 65000 -> "1:05", the length of a clip in a table. */
export const formatClock = (ms: number): string => {
    const total = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(total / SECONDS_PER_MINUTE);
    const seconds = String(total % SECONDS_PER_MINUTE).padStart(2, "0");
    return `${minutes}:${seconds}`;
};
