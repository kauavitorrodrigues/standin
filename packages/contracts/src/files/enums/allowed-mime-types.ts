export const MAP_JSON_MIME_TYPES = ["application/json"] as const;

export const TILESET_IMAGE_MIME_TYPES = ["image/png"] as const;

export const THUMBNAIL_IMAGE_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
] as const;

export const GENERIC_UPLOAD_MIME_TYPES = [
    ...new Set([
        ...MAP_JSON_MIME_TYPES,
        ...TILESET_IMAGE_MIME_TYPES,
        ...THUMBNAIL_IMAGE_MIME_TYPES,
    ]),
] as const;
