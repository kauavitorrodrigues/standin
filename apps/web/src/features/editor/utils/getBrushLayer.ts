import type { EditorModel, LayerName } from "@standin/contracts";
import { getTileLayer } from "@/features/editor/utils/getTileLayer";
import type { EditorBrush } from "@/features/editor/types/editor-brush";

// The layer the brush paints on, by the category of its tile in the tileMeta.
// Null when the tileset is not in the library or the tile has no category.
export const getBrushLayer = (
    model: Pick<EditorModel, "library">,
    brush: EditorBrush
): LayerName | null => {
    const tileset = model.library.tilesets.find(
        ({ id }) => id === brush.tilesetId
    );
    const category = tileset?.tileMeta?.[String(brush.tileIndex)]?.category;
    if (!category) return null;

    return getTileLayer(category);
};
