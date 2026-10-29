import {
    SERVICE_HEALTH_STATUSES,
    type ServiceHealthStatus,
} from "@standin/contracts";

// A degraded instance still serves, so it stays 200 and only a down one tells
// the probe to stop sending traffic.
export const getHealthHttpStatus = (status: ServiceHealthStatus): number =>
    status === SERVICE_HEALTH_STATUSES.DOWN ? 503 : 200;
