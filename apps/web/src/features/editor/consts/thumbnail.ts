// The map photo the editor sends for the list. The server accepts PNG up to
// 3 MB and an aspect within MAX_THUMBNAIL_ASPECT_DRIFT of the map.
export const EDITOR_THUMBNAIL = {
    // Longest side of the final image, in pixels.
    MAX_SIDE: 640,
    MIME_TYPE: "image/png",
    // Key of the temporary texture the map is drawn on. It lives only during
    // a capture.
    TEXTURE_KEY: "editor:thumbnail-capture",
} as const;
