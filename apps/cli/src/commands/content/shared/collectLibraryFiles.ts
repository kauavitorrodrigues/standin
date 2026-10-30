import type { LibrarySeedFile } from "@standin/contracts";
import type { LibraryFileRef } from "../../../types";
import { FILE_AND_PREVIEW_FIELDS, FILE_FIELDS } from "../consts";
import { collectEntryRefs } from "./collectEntryRefs";

// Every PNG library.json names, with the place that names it. The same file
// named twice is listed twice; the reader takes it once.
export const collectLibraryFiles = (
    library: LibrarySeedFile
): LibraryFileRef[] => [
    ...collectEntryRefs("tilesets", library.tilesets, FILE_FIELDS),
    ...collectEntryRefs("assets", library.assets, FILE_FIELDS),
    ...library.assets.flatMap((asset, index) =>
        collectEntryRefs(
            `assets[${index}].variants`,
            asset.variants ?? [],
            FILE_FIELDS
        )
    ),
    ...collectEntryRefs("areas", library.areas, FILE_FIELDS),
    ...collectEntryRefs(
        "avatarBases",
        library.avatarBases,
        FILE_AND_PREVIEW_FIELDS
    ),
    ...collectEntryRefs(
        "avatarParts",
        library.avatarParts,
        FILE_AND_PREVIEW_FIELDS
    ),
    ...library.avatarParts.flatMap((part, index) =>
        collectEntryRefs(
            `avatarParts[${index}].variations`,
            part.variations ?? [],
            FILE_AND_PREVIEW_FIELDS
        )
    ),
];
