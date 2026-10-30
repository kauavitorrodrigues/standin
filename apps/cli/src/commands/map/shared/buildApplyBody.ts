import type { ApplyBody, MapPlan } from "../../../types";

export const buildApplyBody = (
    plan: MapPlan,
    baseVersion: number,
    dryRun: boolean
): ApplyBody => ({
    baseVersion,
    ops: plan.ops,
    validateOnly: dryRun,
});
