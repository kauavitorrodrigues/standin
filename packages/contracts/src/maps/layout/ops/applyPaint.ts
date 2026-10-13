import { TILE_CATEGORIES } from "../../../assets/enums/tile-category";
import {
    LAYOUT_LAYER_NAMES,
    type MapLayout,
} from "../../schemas/layout.schema";
import { LAYER_BY_CATEGORY } from "../consts/layer-by-category";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import { getNextFirstGid } from "../gid";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { LayoutLibrary } from "../library";
import type { PaintOp } from "./types";
import { findOutsideCell } from "./findOutsideCell";
import { findTileLayer } from "./findTileLayer";

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

    if (LAYER_BY_CATEGORY[tile.category] !== op.layer) {
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
    let tileset = layout.tilesets.find(({ name }) => name === op.tilesetId);
    if (!tileset) {
        tileset = {
            name: op.tilesetId,
            firstgid: getNextFirstGid(layout, library),
        };
        layout.tilesets.push(tileset);
    }

    const target = findTileLayer(layout, op.layer);
    if (!target) return [];

    const gid = tileset.firstgid + op.tileIndex;
    const topGid =
        tile.category === TILE_CATEGORIES.WALL && tile.top !== undefined
            ? tileset.firstgid + tile.top
            : null;
    const foreground = findTileLayer(layout, LAYOUT_LAYER_NAMES.FOREGROUND);

    for (const [x, y] of op.cells) {
        target.data[y * layout.width + x] = gid;
        if (topGid !== null && foreground && y > 0) {
            foreground.data[(y - 1) * layout.width + x] = topGid;
        }
    }

    return [];
};
