import type {
    CommandOutput,
    MapApplyDryRunResult,
    MapPlan,
} from "../../../types";
import { MAP_APPLY_MESSAGES } from "./consts";

export const buildMapApplyDryRunOutput = (
    plan: MapPlan,
    baseVersion: number
): CommandOutput => {
    const result: MapApplyDryRunResult = {
        dryRun: true,
        valid: true,
        mapId: plan.mapId,
        baseVersion,
        opCount: plan.ops.length,
    };
    return {
        result,
        lines: [
            MAP_APPLY_MESSAGES.valid(result.opCount, result.mapId),
            MAP_APPLY_MESSAGES.dryRun,
        ],
    };
};
