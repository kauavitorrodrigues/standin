import type { ServiceHealthStatus } from "../enums/service-health-status";

// What the open health endpoint answers. It says whether the instance works,
// never why it does not.
export type PublicHealthReport = {
    status: ServiceHealthStatus;
    // ISO 8601, when the check ran.
    timestamp: string;
    responseTimeMs: number;
};
