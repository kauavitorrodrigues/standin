import {
    LAYOUT_LAYER_NAMES,
    type MapLayout,
} from "../../schemas/layout.schema";
import { resolveGid } from "../gid";
import type { LayoutIssue } from "../issues";
import type { LayoutLibrary } from "../library";
import type { EraseOp } from "./types";
import { findOutsideCell } from "./findOutsideCell";
import { findTileLayer } from "./findTileLayer";
import { retileWalls } from "./retileWalls";

export const applyErase = (
    layout: MapLayout,
    op: EraseOp,
    library: LayoutLibrary
): LayoutIssue[] => {
    const outside = findOutsideCell(layout, op.cells);
    if (outside) return [outside];

    const target = findTileLayer(layout, op.layer);
    if (!target) return [];
    const foreground = findTileLayer(layout, LAYOUT_LAYER_NAMES.FOREGROUND);

    for (const [x, y] of op.cells) {
        const index = y * layout.width + x;
        const erasedGid = target.data[index];
        target.data[index] = 0;

        // Erasing a wall also erases the top it derived on the cell above.
        if (op.layer !== LAYOUT_LAYER_NAMES.WALLS || !foreground || y === 0) {
            continue;
        }
        const erased = resolveGid(layout, library, erasedGid);
        const top = erased
            ? library.tilesets[erased.tilesetId]?.tileMeta?.[
                  String(erased.tileIndex)
              ]?.top
            : undefined;
        const tileset = layout.tilesets.find(
            ({ name }) => name === erased?.tilesetId
        );
        if (top === undefined || !tileset) continue;

        const aboveIndex = (y - 1) * layout.width + x;
        if (foreground.data[aboveIndex] === tileset.firstgid + top) {
            foreground.data[aboveIndex] = 0;
        }
    }

    // The walls next to the erased cells change piece when their run does.
    if (op.layer === LAYOUT_LAYER_NAMES.WALLS) {
        return retileWalls(layout, library, op.cells, "lenient");
    }

    return [];
};
