import type { LibrarySeed } from "@standin/core";

// Reads the folder, or gives the default library when there is none.
export const loadLibraryFrom = async (
    folder: string | undefined
): Promise<LibrarySeed> => {
    const { DEFAULT_LIBRARY_SEED, readLibraryFolder } =
        await import("@standin/core");
    if (!folder) return DEFAULT_LIBRARY_SEED;
    return readLibraryFolder(folder);
};
