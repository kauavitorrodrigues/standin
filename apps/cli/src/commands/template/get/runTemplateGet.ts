import type { MapTemplate } from "@standin/contracts";
import { resolveRemoteTarget } from "../../../config/resolveRemoteTarget";
import type {
    CommandContext,
    CommandOutput,
    RemoteTarget,
    TemplateGetArgs,
} from "../../../types";
import { fetchTemplate } from "../shared/fetchTemplate";
import { buildTemplateGetOutput } from "./buildTemplateGetOutput";

export const runTemplateGet = async ({
    args,
    env,
    config,
    http,
}: CommandContext<TemplateGetArgs>): Promise<CommandOutput> => {
    const target: RemoteTarget = await resolveRemoteTarget(args, env, config);
    const template: MapTemplate = await fetchTemplate(http, target, args.id);
    return buildTemplateGetOutput(template);
};
