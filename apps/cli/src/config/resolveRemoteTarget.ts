import type {
    CliConfigFile,
    CliEnv,
    ConfigStore,
    RemoteArgs,
    RemoteTarget,
} from "../types";
import { pickRemoteValues } from "./pickRemoteValues";
import { requireRemoteTarget } from "./requireRemoteTarget";
import { resolveWithSavedLogin } from "./resolveWithSavedLogin";

// Flag, then variable, then the login file. The file is a pair, written by
// one `standin login`: its token goes only to its own URL, and its URL is
// used only with its own token. The file is read only when a value is missing.
export const resolveRemoteTarget = async (
    args: RemoteArgs,
    env: CliEnv,
    config: ConfigStore
): Promise<RemoteTarget> => {
    const picked: CliConfigFile = pickRemoteValues(args, env);
    if (picked.url && picked.token) return requireRemoteTarget(picked);

    const saved: CliConfigFile | undefined = await config.read();
    return resolveWithSavedLogin(picked, saved);
};
