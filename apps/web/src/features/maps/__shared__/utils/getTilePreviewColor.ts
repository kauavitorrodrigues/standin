import {
    TILE_PREVIEW,
    TILE_PREVIEW_KINDS,
} from "@/features/maps/__shared__/consts/tilePreview";
import type { TilePreviewKind } from "@/features/maps/__shared__/types/tile-preview-kind";

export const getTilePreviewColor = (kind: TilePreviewKind): number => {
    switch (kind) {
        case TILE_PREVIEW_KINDS.ERASE:
            return TILE_PREVIEW.ERASE_COLOR;
        default:
            return TILE_PREVIEW.PAINT_COLOR;
    }
};
