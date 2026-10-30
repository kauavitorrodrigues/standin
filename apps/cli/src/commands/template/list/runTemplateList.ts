import type { MapTemplate } from "@standin/contracts";
import { resolveRemoteTarget } from "../../../config/resolveRemoteTarget";
import type {
    CommandContext,
    CommandOutput,
    RemoteTarget,
    TemplateListArgs,
} from "../../../types";
import { fetchTemplates } from "../shared/fetchTemplates";
import { buildTemplateListOutput } from "./buildTemplateListOutput";

export const runTemplateList = async ({
    args,
    env,
    config,
    http,
}: CommandContext<TemplateListArgs>): Promise<CommandOutput> => {
    const target: RemoteTarget = await resolveRemoteTarget(args, env, config);
    const templates: MapTemplate[] = await fetchTemplates(
        http,
        target,
        args.sizeTier
    );
    return buildTemplateListOutput(templates);
};
