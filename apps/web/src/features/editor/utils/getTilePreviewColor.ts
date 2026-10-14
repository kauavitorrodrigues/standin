import {
    TILE_PREVIEW,
    TILE_PREVIEW_KINDS,
} from "@/features/editor/consts/tilePreview";
import type { TilePreviewKind } from "@/features/editor/types/tile-preview-kind";

export const getTilePreviewColor = (kind: TilePreviewKind): number => {
    switch (kind) {
        case TILE_PREVIEW_KINDS.ERASE:
            return TILE_PREVIEW.ERASE_COLOR;
        default:
            return TILE_PREVIEW.PAINT_COLOR;
    }
};
