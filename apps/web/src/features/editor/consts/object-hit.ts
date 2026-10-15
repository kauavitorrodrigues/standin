// The least alpha (0 to 255) a pixel needs to count as the drawing of an
// object for the pointer. Fainter pixels are treated as empty.
export const OBJECT_HIT = {
    MIN_ALPHA: 16,
} as const;
