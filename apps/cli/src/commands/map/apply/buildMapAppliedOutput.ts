import type { PublishResult } from "@standin/contracts";
import type { CommandOutput, MapApplyResult, MapPlan } from "../../../types";
import { MAP_APPLY_MESSAGES } from "./consts";

export const buildMapAppliedOutput = (
    plan: MapPlan,
    baseVersion: number,
    published: PublishResult
): CommandOutput => {
    const result: MapApplyResult = {
        ...published,
        dryRun: false,
        mapId: plan.mapId,
        baseVersion,
        opCount: plan.ops.length,
    };
    return {
        result,
        lines: [
            MAP_APPLY_MESSAGES.applied(
                result.opCount,
                result.mapId,
                published.version
            ),
            MAP_APPLY_MESSAGES.objects(
                published.limits.objectsUsed,
                published.limits.objectsMax
            ),
        ],
    };
};
