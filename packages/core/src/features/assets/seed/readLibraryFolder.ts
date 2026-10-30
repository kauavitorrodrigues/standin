import { readFile } from "node:fs/promises";
import path from "node:path";
import { LibrarySeedFileSchema } from "@standin/contracts";
import type { LibrarySeed, SeedImages } from "./types";
import { buildLibrarySeed } from "./utils/buildLibrarySeed";
import { listSeedFilePaths } from "./utils/listSeedFilePaths";

const LIBRARY_FILE = "library.json";

/**
 * Reads `library.json` and the PNGs it points to (paths relative to the
 * folder). The entries carry the same fields as the `data` part of the HTTP
 * endpoints, so the seed and the API accept the same input.
 */
export const readLibraryFolder = async (
    folder: string
): Promise<LibrarySeed> => {
    const text = await readFile(path.join(folder, LIBRARY_FILE), "utf8");
    const parsed = LibrarySeedFileSchema.parse(JSON.parse(text));

    const images: SeedImages = new Map();
    await Promise.all(
        listSeedFilePaths(parsed).map(async (file) => {
            images.set(file, await readFile(path.join(folder, file)));
        })
    );

    return buildLibrarySeed(parsed, images);
};
