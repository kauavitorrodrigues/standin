import fs from "node:fs/promises";
import { MISSING_FILE_CODE } from "../consts/fs";
import { ConfigFileUnreadableError } from "../errors/ConfigFileUnreadableError";
import { findErrorCode } from "../utils/findErrorCode";

const UNKNOWN_CODE: string = "UNKNOWN";

// True when there was a file to delete.
export const removeConfigFile = async (
    configPath: string
): Promise<boolean> => {
    try {
        await fs.unlink(configPath);
        return true;
    } catch (error) {
        const code: string | undefined = findErrorCode(error);
        if (code === MISSING_FILE_CODE) return false;
        throw new ConfigFileUnreadableError(configPath, code ?? UNKNOWN_CODE);
    }
};
