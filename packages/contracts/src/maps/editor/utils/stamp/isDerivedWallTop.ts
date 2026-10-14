import { resolveGid, stripGidFlags } from "../../../layout/gid";
import type { LayoutLibrary } from "../../../layout/library";
import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { LAYOUT_LAYER_NAMES } from "../../../schemas/layout.schema";
import type { EditorModel } from "../../types/editor-model";

/**
 * True when the foreground gid at (x, y) is the top the wall on the cell
 * below derives. Painting that wall brings the top back, so a stamp that holds
 * the wall does not need to hold the top.
 */
export const isDerivedWallTop = (
    model: EditorModel,
    library: LayoutLibrary,
    x: number,
    y: number,
    gid: number
): boolean => {
    const walls = findTileLayer(model.layout, LAYOUT_LAYER_NAMES.WALLS);
    const wall = resolveGid(
        model.layout,
        library,
        walls?.data[(y + 1) * model.layout.width + x] ?? 0
    );
    if (!wall) return false;

    const top =
        library.tilesets[wall.tilesetId]?.tileMeta?.[String(wall.tileIndex)]
            ?.top;
    const tileset = model.layout.tilesets.find(
        ({ name }) => name === wall.tilesetId
    );
    if (top === undefined || !tileset) return false;

    return tileset.firstgid + top === stripGidFlags(gid);
};
