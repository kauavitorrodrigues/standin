import path from "node:path";
import { ENV_NAMES } from "../consts/env";
import type { CliEnv } from "../types";

// pnpm runs the script inside apps/cli, so a relative folder is read from the
// directory the user typed the command in.
export const resolveFolder = (folder: string, env: CliEnv): string =>
    path.resolve(env[ENV_NAMES.INIT_CWD] || process.cwd(), folder);
