import { resolveRemoteTarget } from "../../../config/resolveRemoteTarget";
import type {
    CommandContext,
    CommandOutput,
    RemoteTarget,
    StepsProgress,
    TemplateCreateArgs,
    TemplateInput,
    TemplateOutcome,
} from "../../../types";
import { withProgress } from "../../shared/withProgress";
import { buildTemplate } from "../shared/buildTemplate";
import { buildTemplateCreateDryRunOutput } from "./buildTemplateCreateDryRunOutput";
import { buildTemplateCreateOutput } from "./buildTemplateCreateOutput";
import { resolveTemplateInput } from "./resolveTemplateInput";

export const runTemplateCreate = async ({
    args,
    env,
    files,
    config,
    http,
}: CommandContext<TemplateCreateArgs>): Promise<CommandOutput> => {
    const input: TemplateInput = await resolveTemplateInput(args, env, files);
    if (args.dryRun) return buildTemplateCreateDryRunOutput(input, args);

    const target: RemoteTarget = await resolveRemoteTarget(args, env, config);
    const progress: StepsProgress = { done: [] };
    const outcome: TemplateOutcome = await withProgress(progress, () =>
        buildTemplate({ http, target, progress }, input)
    );
    return buildTemplateCreateOutput(outcome);
};
