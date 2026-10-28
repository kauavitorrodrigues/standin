export const MAP_PREVIEW_CAPTURE = {
    // Side in pixels of the hidden stage the capture game boots in.
    STAGE_SIZE: 64,
    // Longest a capture may take, loading the images of the map included.
    TIMEOUT_MS: 8000,
    TIMEOUT_MESSAGE: "Map thumbnail capture took too long",
} as const;
