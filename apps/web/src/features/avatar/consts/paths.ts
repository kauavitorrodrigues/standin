// The only place with the address of the admin routes of the avatar library.
// The paths are relative to the API base URL.
export const AVATAR_PARTS_PATH = "/library/avatar-parts";

// Sub-paths of one part row, behind `AVATAR_PARTS_PATH/:partId`. A row is a
// base part or one of its color variations.
export const AVATAR_PART_SUBPATHS = {
    IMAGE: "image",
    PREVIEW: "preview",
    VARIATIONS: "variations",
} as const;

export const AVATAR_CATEGORIES_PATH = "/library/avatar-categories";

// Sub-paths of one category, behind `AVATAR_CATEGORIES_PATH/:slot`.
export const AVATAR_CATEGORY_SUBPATHS = {
    PREVIEW: "preview",
} as const;

export const AVATAR_BASES_PATH = "/library/avatar-bases";

// Sub-paths of one base, behind `AVATAR_BASES_PATH/:baseId`.
export const AVATAR_BASE_SUBPATHS = {
    IMAGE: "image",
    PREVIEW: "preview",
} as const;

// Sheets versioned in the repository, served from `apps/web/public`.
export const AVATAR_PUBLIC_SHEETS = {
    GHOST: "/avatar/ghost-sheet.png",
} as const;

// Where the API serves a stored file by id, the assembled sheet of an avatar
// included. Relative to the API base URL.
export const AVATAR_FILES_PATH = "/files";
