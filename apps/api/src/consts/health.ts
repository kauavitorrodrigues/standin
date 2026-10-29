export const HEALTH_CACHE_CONTROL = "no-store";
// Probes are frequent (the container checks every few seconds and every proxy
// request shares the address), so the limit is generous. It only stops abuse.
export const HEALTH_RATE_LIMIT_WINDOW_MS = 60_000;
export const HEALTH_RATE_LIMIT_MAX_REQUESTS = 120;
