import type { LibrarySeedFile } from "@standin/contracts";
import type { LibraryCounts } from "../../../types";

// How many entries each section of library.json has.
export const countLibrary = (library: LibrarySeedFile): LibraryCounts => ({
    tilesets: library.tilesets.length,
    assets: library.assets.length,
    bundles: library.bundles.length,
    areas: library.areas.length,
    avatarBases: library.avatarBases.length,
    avatarParts: library.avatarParts.length,
});
