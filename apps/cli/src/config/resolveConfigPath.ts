import os from "node:os";
import path from "node:path";
import { CONFIG_DIR_NAME, CONFIG_FILE_NAME } from "../consts/config";
import { ENV_NAMES } from "../consts/env";
import type { CliEnv } from "../types";
import { pickConfigHome } from "./pickConfigHome";

// $XDG_CONFIG_HOME/standin/config.json, or ~/.config when it is not set. The
// spec says a relative XDG_CONFIG_HOME is to be ignored.
export const resolveConfigPath = (env: CliEnv): string => {
    const home: string = env[ENV_NAMES.HOME] || os.homedir();
    const configHome: string = pickConfigHome(env, home);
    return path.join(configHome, CONFIG_DIR_NAME, CONFIG_FILE_NAME);
};
