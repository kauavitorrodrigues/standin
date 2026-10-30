import fs from "node:fs/promises";
import { MISSING_FILE_CODE } from "../consts/fs";
import { ConfigFileUnreadableError } from "../errors/ConfigFileUnreadableError";
import type { CliConfigFile } from "../types";
import { findErrorCode } from "../utils/findErrorCode";
import { parseConfigFile } from "./parseConfigFile";

const UNKNOWN_CODE: string = "UNKNOWN";

// Undefined when the user never logged in. A file that cannot be read for any
// other reason (permissions, a folder in its place) is said, not hidden.
export const readConfigFile = async (
    configPath: string
): Promise<CliConfigFile | undefined> => {
    let text: string;
    try {
        text = await fs.readFile(configPath, "utf8");
    } catch (error) {
        const code: string | undefined = findErrorCode(error);
        if (code === MISSING_FILE_CODE) return undefined;
        throw new ConfigFileUnreadableError(configPath, code ?? UNKNOWN_CODE);
    }
    return parseConfigFile(text, configPath);
};
