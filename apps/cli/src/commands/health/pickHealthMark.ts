import { SERVICE_HEALTH_STATUSES } from "@standin/contracts";
import type { ServiceHealthStatus } from "@standin/contracts";
import { MESSAGES } from "../../consts/messages";

export const pickHealthMark = (status: ServiceHealthStatus): string => {
    if (status === SERVICE_HEALTH_STATUSES.OK) return MESSAGES.healthMarkOk;
    return MESSAGES.healthMarkWarn;
};
