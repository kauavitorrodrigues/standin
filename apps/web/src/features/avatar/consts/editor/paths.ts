// Routes of the avatar API used by the editor. They live here so a change of
// path touches a single file.
export const AVATAR_API_PATHS = {
    EDITOR: "/avatar/editor",
    CATEGORIES: "/avatar/categories",
    ME: "/users/me/avatar",
} as const;

// Behind `AVATAR_API_PATHS.CATEGORIES/:slot`.
export const AVATAR_CATEGORY_PARTS_SUBPATH = "parts";
