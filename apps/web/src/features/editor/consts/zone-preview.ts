import { EDITOR_ZONES } from "@/features/editor/consts/zones";

// The preview of a zone being created, over the zones already drawn.
export const EDITOR_ZONE_PREVIEW = {
    DEPTH: EDITOR_ZONES.DEPTH + 1,
    INVALID_COLOR: 0xef4444,
    FILL_ALPHA: 0.25,
    OUTLINE_ALPHA: 1,
    GHOST_ALPHA: 0.6,
} as const;
