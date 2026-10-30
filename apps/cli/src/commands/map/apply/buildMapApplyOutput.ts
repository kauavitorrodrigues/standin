import type { PublishResult } from "@standin/contracts";
import type { ApplyAnswer, CommandOutput, MapPlan } from "../../../types";
import { buildMapAppliedOutput } from "./buildMapAppliedOutput";
import { buildMapApplyDryRunOutput } from "./buildMapApplyDryRunOutput";

export const buildMapApplyOutput = (
    plan: MapPlan,
    baseVersion: number,
    dryRun: boolean,
    answer: ApplyAnswer
): CommandOutput => {
    if (dryRun) return buildMapApplyDryRunOutput(plan, baseVersion);
    return buildMapAppliedOutput(plan, baseVersion, answer as PublishResult);
};
