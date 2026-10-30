import fs from "node:fs/promises";
import path from "node:path";
import {
    CONFIG_DIR_MODE,
    CONFIG_FILE_MODE,
    CONFIG_INDENT,
} from "../consts/config";
import type { CliConfigFile } from "../types";
import { removeQuietly } from "./removeQuietly";

// The file holds the token, so it is created for its owner only. It is
// written to a file of its own and renamed over the real one, so a crash
// never leaves half a file and an old, wider mode never survives.
export const writeConfigFile = async (
    configPath: string,
    file: CliConfigFile
): Promise<void> => {
    await fs.mkdir(path.dirname(configPath), {
        recursive: true,
        mode: CONFIG_DIR_MODE,
    });
    const temporary: string = `${configPath}.${process.pid}.tmp`;
    const text: string = `${JSON.stringify(file, null, CONFIG_INDENT)}\n`;
    try {
        await fs.writeFile(temporary, text, {
            mode: CONFIG_FILE_MODE,
            flag: "wx",
        });
        await fs.rename(temporary, configPath);
    } catch (error) {
        await removeQuietly(temporary);
        throw error;
    }
};
