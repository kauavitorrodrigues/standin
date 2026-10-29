import {
    SERVICE_HEALTH_STATUSES,
    type ServiceHealthStatus,
} from "@standin/contracts";
import { HEALTH_CHECK_TIMEOUT_MS } from "../../consts";
import { gradeServiceLatency } from "./gradeServiceLatency";

export type ServiceCheck = {
    status: ServiceHealthStatus;
    latencyMs: number;
};

// Runs a probe against the time limit and says how it went. It never throws:
// a probe that fails or takes too long is a down service, not an error. The
// signal tells a probe that supports it to give up once the limit passed.
export const runServiceCheck = async (
    probe: (signal: AbortSignal) => Promise<unknown>,
    timeoutMs: number = HEALTH_CHECK_TIMEOUT_MS
): Promise<ServiceCheck> => {
    const controller = new AbortController();
    const startedAt = performance.now();
    const elapsed = () => Math.round(performance.now() - startedAt);
    let timer: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
            controller.abort();
            reject(new Error("The health check timed out."));
        }, timeoutMs);
    });

    try {
        await Promise.race([
            Promise.resolve().then(() => probe(controller.signal)),
            timeout,
        ]);
        const latencyMs = elapsed();
        return { status: gradeServiceLatency(latencyMs), latencyMs };
    } catch {
        return { status: SERVICE_HEALTH_STATUSES.DOWN, latencyMs: elapsed() };
    } finally {
        clearTimeout(timer);
    }
};
