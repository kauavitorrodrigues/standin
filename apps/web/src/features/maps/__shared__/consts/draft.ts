// Name of the IndexedDB database that keeps the map editor drafts.
export const DRAFT_DB_NAME = "standin-map-editor";

// Schema version of the database. Bump it when the stores change. Version 2
// keys a draft by (userId, mapId, mode), and moves the older keys to `map`.
export const DRAFT_DB_VERSION = 2;

// Object store holding one draft per (userId, mapId, mode) triple.
export const DRAFT_STORE_NAME = "drafts";

// Wait, in milliseconds, after the last change before the draft is written.
export const DRAFT_SAVE_DELAY_MS = 300;
