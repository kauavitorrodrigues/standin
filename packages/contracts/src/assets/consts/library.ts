const BYTES_IN_KB = 1024;
const BYTES_IN_MB = 1024 * BYTES_IN_KB;

// Limit of one uploaded PNG, for tilesets and assets.
export const MAX_UPLOAD_BYTES = 3 * BYTES_IN_MB;
export const MAX_DATA_PART_BYTES = 256 * BYTES_IN_KB;
export const MAX_TILESET_IMAGE_PX = 4096;
export const MAX_LIBRARY_KEY_LENGTH = 100;
export const MIN_ANIMATION_FRAME_COUNT = 2;

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
