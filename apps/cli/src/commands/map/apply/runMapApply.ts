import { callApi } from "../../../api/callApi";
import type {
    ApplyAnswer,
    ApplyBody,
    CommandContext,
    CommandOutput,
    MapApplyArgs,
    PreparedMap,
} from "../../../types";
import { MAP_PATHS } from "../consts";
import { prepareMapPlan } from "../shared/prepareMapPlan";
import { buildApplyBody } from "./buildApplyBody";
import { buildMapApplyOutput } from "./buildMapApplyOutput";

export const runMapApply = async ({
    args,
    env,
    files,
    config,
    http,
}: CommandContext<MapApplyArgs>): Promise<CommandOutput> => {
    const { target, plan }: PreparedMap = await prepareMapPlan(args, env, {
        files,
        config,
        http,
    });

    const dryRun: boolean = Boolean(args.dryRun);
    const baseVersion: number = args.baseVersion ?? plan.layoutVersion;
    const body: ApplyBody = buildApplyBody(plan, baseVersion, dryRun);
    const answer: ApplyAnswer = await callApi<ApplyAnswer>(http, target, {
        method: "POST",
        path: MAP_PATHS.apply(plan.mapId),
        body,
    });

    return buildMapApplyOutput(plan, baseVersion, dryRun, answer);
};
