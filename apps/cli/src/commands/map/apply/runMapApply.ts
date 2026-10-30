import type {
    ApplyAnswer,
    CommandContext,
    CommandOutput,
    MapApplyArgs,
    PreparedMap,
} from "../../../types";
import { prepareMapPlan } from "../shared/prepareMapPlan";
import { sendMapApply } from "../shared/sendMapApply";
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
    const answer: ApplyAnswer = await sendMapApply(
        http,
        target,
        plan,
        baseVersion,
        dryRun
    );

    return buildMapApplyOutput(plan, baseVersion, dryRun, answer);
};
