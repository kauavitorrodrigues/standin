import type { EditorBrush } from "@/features/editor/types/editor-brush";
import type { PaletteTile } from "@/features/editor/types/palette-tile";

// Whether the brush is this palette tile. A tile that stands for a wall style
// is the brush when the brush is any piece of the style, so picking a wall with
// the eyedropper selects its style.
export const isTileBrush = (
    brush: EditorBrush | null,
    tilesetId: string,
    tile: PaletteTile
): boolean => {
    if (!brush || brush.tilesetId !== tilesetId) return false;
    if (!tile.style) return brush.tileIndex === tile.index;

    return tile.style.pieceIndexes.includes(brush.tileIndex);
};
