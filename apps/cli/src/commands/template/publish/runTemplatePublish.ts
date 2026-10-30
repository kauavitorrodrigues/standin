import type { MapTemplate } from "@standin/contracts";
import { resolveRemoteTarget } from "../../../config/resolveRemoteTarget";
import type {
    CommandContext,
    CommandOutput,
    RemoteTarget,
    TemplatePublishArgs,
} from "../../../types";
import { fetchTemplate } from "../shared/fetchTemplate";
import { publishTemplateOnServer } from "../shared/publishTemplateOnServer";
import { buildTemplatePublishDryRunOutput } from "./buildTemplatePublishDryRunOutput";
import { buildTemplatePublishOutput } from "./buildTemplatePublishOutput";

export const runTemplatePublish = async ({
    args,
    env,
    config,
    http,
}: CommandContext<TemplatePublishArgs>): Promise<CommandOutput> => {
    const target: RemoteTarget = await resolveRemoteTarget(args, env, config);
    if (args.dryRun) {
        const template: MapTemplate = await fetchTemplate(
            http,
            target,
            args.id
        );
        return buildTemplatePublishDryRunOutput(template);
    }

    const published: MapTemplate = await publishTemplateOnServer(
        http,
        target,
        args.id
    );
    return buildTemplatePublishOutput(published);
};
