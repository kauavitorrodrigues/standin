import type { LibraryKeyKind, SpecRef } from "../../types";

const LIBRARY_PATH_PREFIX = {
    asset: "library.assets.",
    tileset: "library.tilesets.",
} as const satisfies Record<LibraryKeyKind, string>;

/** A key written at `path` in the spec, with the path the builders report it by. */
export const libraryRef = (
    kind: LibraryKeyKind,
    ref: string,
    path: string
): SpecRef => ({ path, libraryPath: `${LIBRARY_PATH_PREFIX[kind]}${ref}` });
