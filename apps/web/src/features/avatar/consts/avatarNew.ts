// What the page of a new registration can create. It is the `kind` of the URL.
export const AVATAR_NEW_KINDS = {
    PART: "part",
    COLOR: "color",
    BASE: "base",
    MANNEQUIN: "mannequin",
} as const;

export type AvatarNewKind =
    (typeof AVATAR_NEW_KINDS)[keyof typeof AVATAR_NEW_KINDS];

// Where the pages of the avatar admin live, for the links and the redirects.
export const AVATAR_ADMIN_PATHS = {
    NEW: "/admin/avatar/new",
    PARTS: "/admin/avatar-parts",
    BASES: "/admin/avatar-bases",
} as const;
