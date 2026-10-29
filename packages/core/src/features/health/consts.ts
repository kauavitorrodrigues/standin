// A check that takes longer than this counts as down.
export const HEALTH_CHECK_TIMEOUT_MS = 2000;
// A check that answers, but slower than this, counts as degraded.
export const HEALTH_DEGRADED_LATENCY_MS = 500;
