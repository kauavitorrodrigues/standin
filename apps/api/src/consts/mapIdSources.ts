// Where a route finds the map it changes: the map itself, the space that
// owns it, or the template that owns it.
export const MAP_ID_SOURCES = {
    MAP: "map",
    SPACE: "space",
    TEMPLATE: "template",
} as const;

export type MapIdSource = (typeof MAP_ID_SOURCES)[keyof typeof MAP_ID_SOURCES];

// The editor tab that holds the lock sends its session on this header.
export const EDITOR_SESSION_HEADER = "x-editor-session";
