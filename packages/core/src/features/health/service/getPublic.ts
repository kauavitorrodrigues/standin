import type { PublicHealthReport } from "@standin/contracts";
import { HealthRepository } from "../repository";
import { runServiceCheck } from "./utils/runServiceCheck";

// The short report of the open endpoint. For now the database is the only
// dependency, so its status is the status of the instance.
export const getPublicHealth = async (): Promise<PublicHealthReport> => {
    const startedAt = performance.now();
    const database = await runServiceCheck(HealthRepository.ping);
    return {
        status: database.status,
        timestamp: new Date().toISOString(),
        responseTimeMs: Math.round(performance.now() - startedAt),
    };
};
