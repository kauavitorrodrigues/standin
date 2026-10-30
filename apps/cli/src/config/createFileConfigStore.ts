import type { CliEnv, ConfigStore } from "../types";
import { readConfigFile } from "./readConfigFile";
import { removeConfigFile } from "./removeConfigFile";
import { resolveConfigPath } from "./resolveConfigPath";
import { writeConfigFile } from "./writeConfigFile";

// The login file of the user. The path is resolved once from the environment.
export const createFileConfigStore = (env: CliEnv): ConfigStore => {
    const configPath: string = resolveConfigPath(env);
    return {
        path: configPath,
        read: () => readConfigFile(configPath),
        write: (file) => writeConfigFile(configPath, file),
        remove: () => removeConfigFile(configPath),
    };
};
