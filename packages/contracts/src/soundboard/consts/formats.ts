// The accepted formats live here so adding one is a change in one place. The
// server checks the bytes as well, never only the type the client declared.
export const SOUNDBOARD_MIME_TYPES = ["audio/mpeg"] as const;

export const SOUNDBOARD_EXTENSIONS = [".mp3"] as const;

// What the editor writes and the server stores.
export const SOUNDBOARD_OUTPUT_MIME_TYPE = "audio/mpeg";
export const SOUNDBOARD_OUTPUT_EXTENSION = ".mp3";

// Where clips live in storage.
export const SOUNDBOARD_STORAGE_FOLDER = "soundboard";
