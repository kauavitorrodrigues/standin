import { ENV_NAMES } from "../consts/env";
import type { CliConfigFile, CliEnv, RemoteArgs } from "../types";
import { pickOption } from "../utils/pickOption";

// The flag wins over the variable. The login file comes after both.
export const pickRemoteValues = (
    args: RemoteArgs,
    env: CliEnv
): CliConfigFile => ({
    url: pickOption(args.url, env[ENV_NAMES.STANDIN_URL]),
    token: pickOption(args.token, env[ENV_NAMES.STANDIN_TOKEN]),
});
