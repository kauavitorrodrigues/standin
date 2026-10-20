// The parts of an avatar upload request (part, variation, base or preview), by form field name.
export const AVATAR_UPLOAD_PARTS = {
    IMAGE: "image",
    PREVIEW: "preview",
    DATA: "data",
} as const;

export type AvatarUploadPart =
    (typeof AVATAR_UPLOAD_PARTS)[keyof typeof AVATAR_UPLOAD_PARTS];
