import type {
    CommandContext,
    CommandOutput,
    LogoutArgs,
    LogoutResult,
} from "../../types";
import { buildLogoutOutput } from "./buildLogoutOutput";

export const runLogout = async ({
    args,
    config,
}: CommandContext<LogoutArgs>): Promise<CommandOutput> => {
    const dryRun: boolean = Boolean(args.dryRun);
    const removed: boolean = !dryRun && (await config.remove());

    const result: LogoutResult = { dryRun, configPath: config.path, removed };
    return buildLogoutOutput(result);
};
