export const MAP_OBJECT_MARKER_COLORS = {
    SIT: 0x22c55e,
    TELEPORT: 0x3b82f6,
} as const;

export const MAP_OBJECT_MARKER_ALPHA = 0.35;
// On the floor, just under the placed objects, so the avatars that walk over a
// marker are not tinted by it.
export const MAP_OBJECT_MARKER_DEPTH = 0.9;
