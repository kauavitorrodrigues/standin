import { TILE_CATEGORIES } from "../../../assets/enums/tile-category";
import {
    LAYOUT_AREA_FLOOR_LAYER_NAME,
    LAYOUT_LAYER_NAMES,
    type MapLayout,
} from "../../schemas/layout.schema";
import { LAYER_BY_CATEGORY } from "../consts/layer-by-category";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import { computeGid } from "../../editor/utils/computeGid";
import { ensureTileset } from "../../editor/utils/ensureTileset";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { LayoutLibrary } from "../library";
import type { PaintOp } from "./types";
import { findOutsideCell } from "./findOutsideCell";
import { ensureAreaFloorLayer } from "./ensureAreaFloorLayer";
import { findTileLayer } from "./findTileLayer";
import { describeWallTile, retileWalls } from "./retileWalls";

export const applyPaint = (
    layout: MapLayout,
    op: PaintOp,
    library: LayoutLibrary
): LayoutIssue[] => {
    const source = library.tilesets[op.tilesetId];
    const tile = source?.tileMeta?.[String(op.tileIndex)];
    if (!source || !tile || op.tileIndex >= source.tileCount) {
        return [
            createIssue(
                Code.TILE_NOT_IN_LIBRARY,
                op.tilesetId,
                Messages.tileNotInLibrary
            ),
        ];
    }

    // The floor of an area takes floor tiles, like the ground.
    const expectedLayer =
        op.layer === LAYOUT_AREA_FLOOR_LAYER_NAME
            ? LAYER_BY_CATEGORY[tile.category] === LAYOUT_LAYER_NAMES.GROUND
                ? LAYOUT_AREA_FLOOR_LAYER_NAME
                : null
            : LAYER_BY_CATEGORY[tile.category];
    if (expectedLayer !== op.layer) {
        return [
            createIssue(
                Code.CATEGORY_LAYER_MISMATCH,
                op.layer,
                Messages.categoryLayerMismatch
            ),
        ];
    }

    const outside = findOutsideCell(layout, op.cells);
    if (outside) return [outside];

    // A tileset is added after the last one, never reordered or removed.
    layout.tilesets = ensureTileset(layout, op.tilesetId, library).tilesets;

    const target =
        op.layer === LAYOUT_AREA_FLOOR_LAYER_NAME
            ? ensureAreaFloorLayer(layout)
            : findTileLayer(layout, op.layer);
    if (!target) return [];

    const gid = computeGid(layout, op.tilesetId, op.tileIndex, library);
    const topGid =
        tile.category === TILE_CATEGORIES.WALL && tile.top !== undefined
            ? computeGid(layout, op.tilesetId, tile.top, library)
            : null;
    const foreground = findTileLayer(layout, LAYOUT_LAYER_NAMES.FOREGROUND);

    for (const [x, y] of op.cells) {
        target.data[y * layout.width + x] = gid;
        if (topGid !== null && foreground && y > 0) {
            foreground.data[(y - 1) * layout.width + x] = topGid;
        }
    }

    // A piece of a wall style is only a hint of the style: the piece that
    // stays on each cell is the one its neighbors ask for.
    if (
        op.layer === LAYOUT_LAYER_NAMES.WALLS &&
        describeWallTile(library, op.tilesetId, op.tileIndex)
    ) {
        return retileWalls(layout, library, op.cells, "strict");
    }

    return [];
};
