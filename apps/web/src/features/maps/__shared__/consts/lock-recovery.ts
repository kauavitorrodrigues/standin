// Wait in ms before each try to get the lock back, indexed by the try that is
// about to run. The first one is immediate. They grow so a server that is
// restarting has time to come back. The number of delays is the number of tries.
export const LOCK_RECOVERY_DELAYS_MS = [0, 1000, 2000, 4000, 8000] as const;

// How long a try to get the lock back waits for the answer of the server.
export const LOCK_ACK_TIMEOUT_MS = 5000;

// What to do after a try to get the lock back.
export const LOCK_RECOVERY = {
    RESUME: "resume",
    RETRY: "retry",
    GIVE_UP: "giveUp",
} as const;

// Why the editor stops trying and stays blocked.
export const LOCK_GIVE_UP_REASON = {
    DENIED: "denied",
    VERSION_CHANGED: "versionChanged",
} as const;

// How a try to get the lock back ended.
export const LOCK_ACQUIRE_OUTCOME = {
    NETWORK: "network",
    GRANTED: "granted",
    DENIED: "denied",
} as const;
