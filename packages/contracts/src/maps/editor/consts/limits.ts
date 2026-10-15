// Most cells a single paint or erase operation may touch (tiles).
export const MAX_CELLS_PER_OP = 2500;

// Most operations accepted in one publish request (operations).
export const MAX_PUBLISH_OPS = 5000;

// Most steps kept in the editor undo history (operations).
export const UNDO_STACK_LIMIT = 200;

// Zoom multipliers the editor offers (scale factor).
export const ZOOM_LEVELS = [1, 2, 3] as const;

// Smallest zone area the editor accepts (tiles).
export const ZONE_AREA_MIN_TILES = 2;

// How often the editing client renews its lock (milliseconds).
export const LOCK_HEARTBEAT_MS = 15000;

// How long a lock lives without a heartbeat (milliseconds).
export const LOCK_TTL_MS = 45000;

// Largest publish request body (bytes).
export const MAX_PUBLISH_BODY_BYTES = 5 * 1024 * 1024;

// Background the inverse of set_background restores when the layout had none (hex color).
export const EDITOR_DEFAULT_BACKGROUND_COLOR = "#000000";

// How often the server removes expired editor locks (milliseconds).
export const LOCK_SWEEP_INTERVAL_MS = 5000;

// Stamp format version written by the area composer (version number).
export const STAMP_VERSION = 1;

// Smallest side of a stamp (tiles). Matches ZONE_AREA_MIN_TILES.
export const STAMP_MIN_SIZE = 2;

// Widest stamp (tiles).
export const STAMP_MAX_WIDTH = 40;

// Tallest stamp (tiles).
export const STAMP_MAX_HEIGHT = 30;

// Most objects one stamp may hold (objects).
export const STAMP_MAX_OBJECTS = 200;
