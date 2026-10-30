import {
    LibrarySeedDuplicateFileError,
    LibrarySeedFileInvalidError,
    SEED_LIBRARY_PART,
} from "@standin/contracts";
import type { LibrarySeedUpload, SeedImages } from "@standin/core";
import type { ExtendedRequest } from "@/types/request";

/**
 * The text of library.json (the `library` field, a reserved part name) and the
 * files by the name of their part, which is the path library.json writes for
 * them. A file named `library` or a path sent twice is refused.
 */
export const readSeedParts = (req: ExtendedRequest): LibrarySeedUpload => {
    const text: unknown = req.body?.[SEED_LIBRARY_PART];
    if (typeof text !== "string") {
        throw new LibrarySeedFileInvalidError([
            `The "${SEED_LIBRARY_PART}" text field is required.`,
        ]);
    }

    const images: SeedImages = new Map();
    for (const file of (req.files as Express.Multer.File[] | undefined) ?? []) {
        if (file.fieldname === SEED_LIBRARY_PART) {
            throw new LibrarySeedFileInvalidError([
                `"${SEED_LIBRARY_PART}" is reserved for library.json and must be a text field.`,
            ]);
        }
        if (images.has(file.fieldname)) {
            throw new LibrarySeedDuplicateFileError(file.fieldname);
        }
        images.set(file.fieldname, file.buffer);
    }
    return { libraryText: text, images };
};
