import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import { resolveGid } from "../../../layout/gid";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../../layout/issues";
import type { LayoutLibrary } from "../../../layout/library";
import {
    LAYOUT_LAYER_NAMES,
    type MapLayout,
} from "../../../schemas/layout.schema";
import { MAX_CELLS_PER_OP } from "../../consts/limits";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { Cell } from "../../types/cell";
import type { CellDiff } from "../../types/cell-diff";
import { chunkCells } from "../chunkCells";
import { findTileLayer } from "../../../layout/ops/findTileLayer";

type TileInverse =
    { ok: true; inverse: EditorOp[] } | { ok: false; errors: LayoutIssue[] };

// The wall top lives on the foreground, so that layer goes last: painting a
// wall on the other layers writes its top again.
const sortForegroundLast = (layers: string[]): string[] =>
    [...layers].sort(
        (a, b) =>
            Number(a === LAYOUT_LAYER_NAMES.FOREGROUND) -
            Number(b === LAYOUT_LAYER_NAMES.FOREGROUND)
    );

const readGid = (
    layout: MapLayout,
    layerName: string,
    x: number,
    y: number
): number => findTileLayer(layout, layerName)?.data[y * layout.width + x] ?? 0;

/**
 * True when the foreground gid of the change is the top that the wall on the
 * cell below derives. Painting that wall again brings the top back, so the
 * inverse repaints the wall instead of the top, which has no tile meta.
 */
const isDerivedTop = (
    before: MapLayout,
    library: LayoutLibrary,
    change: CellDiff
): boolean => {
    if (change.layer !== LAYOUT_LAYER_NAMES.FOREGROUND) return false;

    const wall = resolveGid(
        before,
        library,
        readGid(before, LAYOUT_LAYER_NAMES.WALLS, change.x, change.y + 1)
    );
    if (!wall) return false;

    const top =
        library.tilesets[wall.tilesetId]?.tileMeta?.[String(wall.tileIndex)]
            ?.top;
    const tileset = before.tilesets.find(({ name }) => name === wall.tilesetId);
    if (top === undefined || !tileset) return false;

    return tileset.firstgid + top === change.before;
};

/**
 * Operations that put the cells of a diff back as they were. Cells that were
 * empty become an erase, the others a paint with the tileset and the index
 * their previous gid points at, grouped by layer and by that gid.
 */
export const buildTileInverse = (
    before: MapLayout,
    library: LayoutLibrary,
    diff: CellDiff[]
): TileInverse => {
    const changedWalls = new Set(
        diff
            .filter(({ layer }) => layer === LAYOUT_LAYER_NAMES.WALLS)
            .map(({ x, y }) => `${x},${y}`)
    );
    const groups = new Map<string, Map<number, Cell[]>>();
    const add = (layer: string, gid: number, cell: Cell) => {
        const byGid = groups.get(layer) ?? new Map<number, Cell[]>();
        byGid.set(gid, [...(byGid.get(gid) ?? []), cell]);
        groups.set(layer, byGid);
    };

    for (const change of diff) {
        if (!isDerivedTop(before, library, change)) {
            add(change.layer, change.before, [change.x, change.y]);
            continue;
        }
        // The wall below rewrites this top. When the wall is not part of the
        // change, repaint it just for that.
        if (changedWalls.has(`${change.x},${change.y + 1}`)) continue;
        add(
            LAYOUT_LAYER_NAMES.WALLS,
            readGid(before, LAYOUT_LAYER_NAMES.WALLS, change.x, change.y + 1),
            [change.x, change.y + 1]
        );
    }

    const inverse: EditorOp[] = [];

    for (const layer of sortForegroundLast([...groups.keys()])) {
        for (const [gid, cells] of groups.get(layer) ?? []) {
            if (gid === 0) {
                for (const chunk of chunkCells(cells, MAX_CELLS_PER_OP)) {
                    inverse.push({ type: "erase", layer, cells: chunk });
                }
                continue;
            }

            const tile = resolveGid(before, library, gid);
            if (!tile) {
                return {
                    ok: false,
                    errors: [
                        createIssue(
                            Code.GID_OUT_OF_RANGE,
                            layer,
                            Messages.gidOutOfRange(layer)
                        ),
                    ],
                };
            }
            for (const chunk of chunkCells(cells, MAX_CELLS_PER_OP)) {
                inverse.push({
                    type: "paint",
                    layer,
                    tilesetId: tile.tilesetId,
                    tileIndex: tile.tileIndex,
                    cells: chunk,
                });
            }
        }
    }

    return { ok: true, inverse };
};
