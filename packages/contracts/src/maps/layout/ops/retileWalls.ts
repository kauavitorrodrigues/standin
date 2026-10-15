import { TILE_CATEGORIES } from "../../../assets/enums/tile-category";
import type { WallPiece } from "../../../assets/enums/wall-edge";
import { getWallPiece } from "../../../assets/utils/wallPiece";
import { getWallStyles } from "../../../assets/utils/wallStyle";
import {
    LAYOUT_LAYER_NAMES,
    type MapLayout,
} from "../../schemas/layout.schema";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import { resolveGid, stripGidFlags } from "../gid";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { LayoutLibrary } from "../library";
import { cellKey } from "../readWallCells";
import { findTileLayer } from "./findTileLayer";
import { pickWallPiece } from "./pickWallPiece";

type Cell = [number, number];

// The style a wall tile belongs to. The key joins the tileset and the name,
// since two tilesets can both have a style called the same.
type WallTileStyle = {
    key: string;
    tilesetId: string;
    style: string;
};

export type RetileMode = "strict" | "lenient";

// The wall style of a tile, or null when it is not a piece of a style: not a
// wall, no style name, or edges that are not one of the eight pieces.
export const describeWallTile = (
    library: LayoutLibrary,
    tilesetId: string,
    tileIndex: number
): WallTileStyle | null => {
    const entry = library.tilesets[tilesetId]?.tileMeta?.[String(tileIndex)];
    if (!entry || entry.category !== TILE_CATEGORIES.WALL) return null;
    if (!entry.style || !entry.edges || !getWallPiece(entry.edges)) return null;

    return {
        key: `${tilesetId}|${entry.style}`,
        tilesetId,
        style: entry.style,
    };
};

// The tile index that draws a piece in a style, or undefined when the style
// has no tile for it.
export const findPieceIndex = (
    library: LayoutLibrary,
    tilesetId: string,
    style: string,
    piece: WallPiece
): number | undefined => {
    const meta = library.tilesets[tilesetId]?.tileMeta;
    if (!meta) return undefined;

    return getWallStyles(meta).find(({ name }) => name === style)?.pieces[
        piece
    ]?.[0]?.index;
};

type Change = { column: number; row: number; tileIndex: number };

// Drops the top a wall derived on the row above, when it is still there.
const clearTop = (
    layout: MapLayout,
    library: LayoutLibrary,
    foreground: ReturnType<typeof findTileLayer>,
    gid: number,
    column: number,
    row: number
): void => {
    const old = resolveGid(layout, library, gid);
    if (!old || !foreground || row === 0) return;

    const top =
        library.tilesets[old.tilesetId]?.tileMeta?.[String(old.tileIndex)]?.top;
    const tileset = layout.tilesets.find(({ name }) => name === old.tilesetId);
    if (top === undefined || !tileset) return;

    const above = (row - 1) * layout.width + column;
    if (stripGidFlags(foreground.data[above]) === tileset.firstgid + top) {
        foreground.data[above] = 0;
    }
};

const writeCell = (
    layout: MapLayout,
    library: LayoutLibrary,
    change: Change,
    tilesetId: string
): void => {
    const walls = findTileLayer(layout, LAYOUT_LAYER_NAMES.WALLS);
    const foreground = findTileLayer(layout, LAYOUT_LAYER_NAMES.FOREGROUND);
    const tileset = layout.tilesets.find(({ name }) => name === tilesetId);
    if (!walls || !tileset) return;

    const index = change.row * layout.width + change.column;
    clearTop(
        layout,
        library,
        foreground,
        walls.data[index],
        change.column,
        change.row
    );
    walls.data[index] = tileset.firstgid + change.tileIndex;

    const top =
        library.tilesets[tilesetId]?.tileMeta?.[String(change.tileIndex)]?.top;
    if (top !== undefined && foreground && change.row > 0) {
        foreground.data[(change.row - 1) * layout.width + change.column] =
            tileset.firstgid + top;
    }
};

/**
 * Gives every wall cell near the seeds the piece its neighbors ask for. A
 * piece depends on the whole run it belongs to (a row is the back wall or the
 * front wall by where its ends turn), so the whole group of connected cells of
 * the same style is worked out again, not just the cells next to a seed.
 *
 * In strict mode a shape no piece draws, or a style without a piece it needs,
 * is returned as an issue and nothing is written. In lenient mode, which an
 * erase uses, such cells are left as they are.
 */
export const retileWalls = (
    layout: MapLayout,
    library: LayoutLibrary,
    seeds: readonly Cell[],
    mode: RetileMode
): LayoutIssue[] => {
    const walls = findTileLayer(layout, LAYOUT_LAYER_NAMES.WALLS);
    if (!walls) return [];

    const rows = Math.floor(walls.data.length / layout.width);
    const styleAt = (column: number, row: number) => {
        if (column < 0 || row < 0 || column >= layout.width || row >= rows) {
            return null;
        }
        const tile = resolveGid(
            layout,
            library,
            walls.data[row * layout.width + column]
        );
        if (!tile) return null;
        return {
            tile,
            style: describeWallTile(library, tile.tilesetId, tile.tileIndex),
        };
    };

    const visited = new Set<string>();
    const changes: { change: Change; tilesetId: string }[] = [];
    const issues: LayoutIssue[] = [];

    const starts = seeds.flatMap(([column, row]) => [
        [column, row],
        [column + 1, row],
        [column - 1, row],
        [column, row + 1],
        [column, row - 1],
    ]);

    for (const [startColumn, startRow] of starts) {
        if (visited.has(cellKey(startColumn, startRow))) continue;
        const first = styleAt(startColumn, startRow)?.style;
        if (!first) continue;

        // The group of connected cells of this style.
        const group: Cell[] = [];
        const queue: Cell[] = [[startColumn, startRow]];
        visited.add(cellKey(startColumn, startRow));
        while (queue.length > 0) {
            const [column, row] = queue.pop() as Cell;
            group.push([column, row]);
            for (const [nextColumn, nextRow] of [
                [column + 1, row],
                [column - 1, row],
                [column, row + 1],
                [column, row - 1],
            ] as Cell[]) {
                const key = cellKey(nextColumn, nextRow);
                if (visited.has(key)) continue;
                if (styleAt(nextColumn, nextRow)?.style?.key !== first.key) {
                    continue;
                }
                visited.add(key);
                queue.push([nextColumn, nextRow]);
            }
        }

        const cells = new Set(
            group.map(([column, row]) => cellKey(column, row))
        );
        for (const [column, row] of group) {
            const picked = pickWallPiece(cells, column, row);
            const tileIndex = picked.ok
                ? findPieceIndex(
                      library,
                      first.tilesetId,
                      first.style,
                      picked.piece
                  )
                : undefined;

            if (!picked.ok || tileIndex === undefined) {
                issues.push(
                    createIssue(
                        picked.ok
                            ? Code.WALL_STYLE_INCOMPLETE
                            : Code.WALL_SHAPE_UNSUPPORTED,
                        cellKey(column, row),
                        picked.ok
                            ? Messages.wallStyleIncomplete
                            : Messages.wallShapeUnsupported
                    )
                );
                continue;
            }
            const current = styleAt(column, row);
            if (current?.tile.tileIndex === tileIndex) continue;
            changes.push({
                change: { column, row, tileIndex },
                tilesetId: first.tilesetId,
            });
        }
    }

    if (mode === "strict" && issues.length > 0) return issues.slice(0, 1);

    changes.forEach(({ change, tilesetId }) =>
        writeCell(layout, library, change, tilesetId)
    );

    return [];
};
