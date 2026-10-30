import type { PublicHealthReport } from "@standin/contracts";
import { SERVICE_HEALTH_STATUSES } from "@standin/contracts";
import { MESSAGES } from "../../consts/messages";
import { InstanceDownError } from "../../errors/InstanceDownError";
import type { CommandContext, CommandOutput, HealthArgs } from "../../types";
import { pickHealthMark } from "./pickHealthMark";

export const runHealth = async ({
    services,
}: CommandContext<HealthArgs>): Promise<CommandOutput> => {
    const report: PublicHealthReport = await services.getHealth();
    if (report.status === SERVICE_HEALTH_STATUSES.DOWN) {
        throw new InstanceDownError(report.responseTimeMs);
    }

    const line: string = MESSAGES.healthLine(
        pickHealthMark(report.status),
        report.status,
        report.responseTimeMs
    );

    return { result: report, lines: [line] };
};
