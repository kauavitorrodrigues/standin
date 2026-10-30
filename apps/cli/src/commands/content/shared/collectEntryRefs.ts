import type { LibraryFileRef } from "../../../types";

// The files named by the entries of a section of library.json, in the fields
// that name one. `section` is the path of the section in the file.
export const collectEntryRefs = (
    section: string,
    entries: object[],
    fields: string[]
): LibraryFileRef[] =>
    entries.flatMap((entry, index) =>
        fields.flatMap((field): LibraryFileRef[] => {
            const value: unknown = (entry as Record<string, unknown>)[field];
            if (typeof value !== "string") return [];
            return [{ file: value, path: `${section}[${index}].${field}` }];
        })
    );
