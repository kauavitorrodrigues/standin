import type { TILE_PREVIEW_KINDS } from "@/features/maps/__shared__/consts/tilePreview";

export type TilePreviewKind =
    (typeof TILE_PREVIEW_KINDS)[keyof typeof TILE_PREVIEW_KINDS];
