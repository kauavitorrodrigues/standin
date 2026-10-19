// What a base is for. A BODY is the blank avatar a person wears, and the one
// shown to whoever has no parts. A MANNEQUIN is the unclothed figure the admin
// dresses to preview a part, and it is never chosen by a person.
export const AVATAR_BASE_KINDS = {
    BODY: "BODY",
    MANNEQUIN: "MANNEQUIN",
} as const;

export type AvatarBaseKind =
    (typeof AVATAR_BASE_KINDS)[keyof typeof AVATAR_BASE_KINDS];

export const AVATAR_BASE_KIND_VALUES = Object.values(AVATAR_BASE_KINDS);
