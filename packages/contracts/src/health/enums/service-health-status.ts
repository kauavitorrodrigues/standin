// How a dependency answered a check: within the expected time, slowly, or not
// at all.
export const SERVICE_HEALTH_STATUSES = {
    OK: "ok",
    DEGRADED: "degraded",
    DOWN: "down",
} as const;

export type ServiceHealthStatus =
    (typeof SERVICE_HEALTH_STATUSES)[keyof typeof SERVICE_HEALTH_STATUSES];
