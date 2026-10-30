import type { LibrarySeed } from "@standin/core";
import { LibraryFolderInvalidError } from "../../errors/LibraryFolderInvalidError";
import type { CliEnv, CliServices } from "../../types";
import { formatReadFailure } from "../../utils/formatReadFailure";
import { isFolderReadFailure } from "../../utils/isFolderReadFailure";
import { resolveFolder } from "../../utils/resolveFolder";

// A folder that cannot be read is a problem of the input. Any other failure
// (the core failing to load, a domain error) is not, and goes up as it is.
export const loadLibrary = async (
    services: CliServices,
    folder: string | undefined,
    env: CliEnv
): Promise<LibrarySeed> => {
    if (!folder) return services.loadLibrary(undefined);
    const resolved: string = resolveFolder(folder, env);
    try {
        return await services.loadLibrary(resolved);
    } catch (error) {
        if (!isFolderReadFailure(error)) throw error;
        throw new LibraryFolderInvalidError(resolved, formatReadFailure(error));
    }
};
