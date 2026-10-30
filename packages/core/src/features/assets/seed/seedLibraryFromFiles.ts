import {
    LibrarySeedFileInvalidError,
    LibrarySeedFileSchema,
} from "@standin/contracts";
import type { LibrarySeedFile } from "@standin/contracts";
import { seedLibrary } from "./seedLibrary";
import type {
    LibrarySeedPreview,
    LibrarySeedResult,
    LibrarySeedUpload,
    SeedFromFilesOptions,
} from "./types";
import { buildLibrarySeed } from "./utils/buildLibrarySeed";

const parseLibraryText = (text: string): LibrarySeedFile => {
    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        throw new LibrarySeedFileInvalidError([
            "library.json is not valid JSON.",
        ]);
    }
    const parsed = LibrarySeedFileSchema.safeParse(json);
    if (parsed.success) return parsed.data;
    throw new LibrarySeedFileInvalidError(
        parsed.error.issues.map(
            ({ path, message }) =>
                `${path.map(String).join(".") || "library"}: ${message}`
        )
    );
};

/**
 * Seeds the global library from the text of `library.json` and the PNGs it
 * points to, as an upload sends them. A dry run only checks that library.json
 * parses against the schema and that every file it names was uploaded, then
 * counts the entries. It decodes no image, resolves no key and writes nothing.
 */
export const seedLibraryFromFiles = async (
    input: LibrarySeedUpload,
    options: SeedFromFilesOptions
): Promise<LibrarySeedResult | LibrarySeedPreview> => {
    const file = parseLibraryText(input.libraryText);
    const seed = buildLibrarySeed(file, input.images);

    if (options.dryRun) {
        return {
            dryRun: true,
            counts: {
                tilesets: seed.tilesets.length,
                assets: seed.assets.length,
                bundles: seed.bundles?.length ?? 0,
                areas: seed.areas?.length ?? 0,
                avatarBases: seed.avatarBases?.length ?? 0,
                avatarParts: seed.avatarParts?.length ?? 0,
            },
        };
    }
    return seedLibrary(seed, { createdBy: options.createdBy });
};
