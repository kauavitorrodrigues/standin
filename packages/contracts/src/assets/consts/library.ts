const BYTES_IN_KB = 1024;
const BYTES_IN_MB = 1024 * BYTES_IN_KB;

// Limit of one uploaded PNG, for tilesets and assets.
export const MAX_UPLOAD_BYTES = 3 * BYTES_IN_MB;
export const MAX_DATA_PART_BYTES = 256 * BYTES_IN_KB;
// A library seed upload: `library.json` as the text field `library` (a
// reserved name, so no file may use it) plus every PNG as a file part named by
// its path. The total is checked by Content-Length before the body is read.
export const MAX_SEED_FILES = 300;
export const MAX_SEED_LIBRARY_BYTES = 4 * BYTES_IN_MB;
export const MAX_SEED_TOTAL_BYTES = 64 * BYTES_IN_MB;
export const MAX_SEED_PART_NAME_LENGTH = 255;
export const SEED_LIBRARY_PART = "library";

export const MAX_TILESET_IMAGE_PX = 4096;
export const MAX_LIBRARY_KEY_LENGTH = 100;
export const MIN_ANIMATION_FRAME_COUNT = 2;

// How many collision cells fit in one tile, per side. The collision mask of a
// footprint has this many cells per tile, so with 4 a cell is 8 px.
export const SOLID_MASK_SUBDIVISION = 4;

// The two parts of an upload request, by form field name.
export const LIBRARY_UPLOAD_PARTS = {
    IMAGE: "image",
    DATA: "data",
} as const;

export type LibraryUploadPart =
    (typeof LIBRARY_UPLOAD_PARTS)[keyof typeof LIBRARY_UPLOAD_PARTS];

export const LIBRARY_FAMILY_SORTS = {
    NAME: "name",
    TYPE: "type",
} as const;

export type LibraryFamilySort =
    (typeof LIBRARY_FAMILY_SORTS)[keyof typeof LIBRARY_FAMILY_SORTS];

export const DEFAULT_LIBRARY_FAMILY_PAGE_SIZE = 24;
export const MAX_LIBRARY_FAMILY_PAGE_SIZE = 100;
export const MAX_LIBRARY_SEARCH_LENGTH = 100;

// How far a tileset is in having a category on its tiles.
export const LIBRARY_TILESET_PROGRESS = {
    COMPLETE: "complete",
    INCOMPLETE: "incomplete",
} as const;

export const LIBRARY_TILESET_PROGRESSES = Object.values(
    LIBRARY_TILESET_PROGRESS
);

export type LibraryTilesetProgress =
    (typeof LIBRARY_TILESET_PROGRESS)[keyof typeof LIBRARY_TILESET_PROGRESS];
