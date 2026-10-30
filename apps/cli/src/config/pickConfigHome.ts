import path from "node:path";
import { CONFIG_HOME_FALLBACK } from "../consts/config";
import { ENV_NAMES } from "../consts/env";
import type { CliEnv } from "../types";

// XDG_CONFIG_HOME when it is an absolute path, otherwise ~/.config.
export const pickConfigHome = (env: CliEnv, home: string): string => {
    const configured: string | undefined = env[ENV_NAMES.XDG_CONFIG_HOME];
    if (configured && path.isAbsolute(configured)) return configured;
    return path.join(home, CONFIG_HOME_FALLBACK);
};
