import {
    SERVICE_HEALTH_STATUSES,
    type ServiceHealthStatus,
} from "@standin/contracts";
import { HEALTH_DEGRADED_LATENCY_MS } from "../../consts";

// An answer is ok, or degraded when it came late. Not answering is graded by
// the caller as down.
export const gradeServiceLatency = (latencyMs: number): ServiceHealthStatus =>
    latencyMs > HEALTH_DEGRADED_LATENCY_MS
        ? SERVICE_HEALTH_STATUSES.DEGRADED
        : SERVICE_HEALTH_STATUSES.OK;
