import { ASSET_PLACEMENTS } from "../../../assets/enums/asset-placement";
import { TILE_CATEGORIES } from "../../../assets/enums/tile-category";
import {
    LAYOUT_ISSUE_CODES as Code,
    type LayoutIssueCode,
} from "../../layout/issues";
import { LAYOUT_LAYER_NAMES } from "../../schemas/layout.schema";
import type { EditorModel } from "../types/editor-model";
import type { TileConflict } from "../types/tile-conflict";
import type { TileConflictOp } from "../types/tile-conflict-op";
import { footprintCells } from "./footprintCells";
import { listPlacedWithAsset } from "./placement/listPlacedWithAsset";
import { isWallTile } from "./placement/isWallTile";

const cellKey = (x: number, y: number): string => `${x},${y}`;

/** Cells covered by the footprint of the placed objects with a placement. */
const coveredCells = (
    model: EditorModel,
    placement: string
): Set<string> => {
    const covered = new Set<string>();
    for (const { placed, asset } of listPlacedWithAsset(model)) {
        if (asset.placement !== placement) continue;
        for (const { x, y } of footprintCells(asset, placed.tileX, placed.tileY)) {
            covered.add(cellKey(x, y));
        }
    }
    return covered;
};

/** True when the painted tile is a WALL tile of the palette. */
const paintsWallTile = (
    model: EditorModel,
    op: Extract<TileConflictOp, { type: "paint" }>
): boolean => {
    const tileset = model.library.tilesets.find(({ id }) => id === op.tilesetId);
    return (
        tileset?.tileMeta?.[String(op.tileIndex)]?.category ===
        TILE_CATEGORIES.WALL
    );
};

/**
 * Cells of a paint or erase that conflict with a placed object (spec 4.4).
 * Only the walls layer conflicts: a WALL tile cannot go under a GROUND
 * object, and a WALL tile under a WALL object cannot be erased or replaced by
 * something that is not a wall. Floor, decoration and ceiling never conflict.
 */
export const findTileConflicts = (
    model: EditorModel,
    op: TileConflictOp
): TileConflict[] => {
    if (op.layer !== LAYOUT_LAYER_NAMES.WALLS) return [];
    if (model.placed.length === 0) return [];

    const paintsWall = op.type === "paint" && paintsWallTile(model, op);
    const groundCells = paintsWall
        ? coveredCells(model, ASSET_PLACEMENTS.GROUND)
        : new Set<string>();
    const mountedCells = paintsWall
        ? new Set<string>()
        : coveredCells(model, ASSET_PLACEMENTS.WALL);

    const conflicts: TileConflict[] = [];
    for (const cell of op.cells) {
        const [x, y] = cell;
        let code: LayoutIssueCode | null = null;
        if (groundCells.has(cellKey(x, y))) {
            code = Code.CELL_OCCUPIED_BY_OBJECT;
        } else if (mountedCells.has(cellKey(x, y)) && isWallTile(model, x, y)) {
            code = Code.WALL_HAS_MOUNTED_OBJECT;
        }
        if (code) conflicts.push({ cell, code });
    }
    return conflicts;
};
