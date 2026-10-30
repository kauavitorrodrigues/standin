import { pickRemoteValues } from "../../config/pickRemoteValues";
import { requireRemoteTarget } from "../../config/requireRemoteTarget";
import type {
    CommandContext,
    CommandOutput,
    LoginArgs,
    LoginResult,
    RemoteTarget,
} from "../../types";
import { buildLoginOutput } from "./buildLoginOutput";

export const runLogin = async ({
    args,
    env,
    config,
}: CommandContext<LoginArgs>): Promise<CommandOutput> => {
    const target: RemoteTarget = requireRemoteTarget(
        pickRemoteValues(args, env)
    );
    const dryRun: boolean = Boolean(args.dryRun);
    if (!dryRun) await config.write({ url: target.url, token: target.token });

    const result: LoginResult = {
        dryRun,
        url: target.url,
        configPath: config.path,
    };
    return buildLoginOutput(result);
};
