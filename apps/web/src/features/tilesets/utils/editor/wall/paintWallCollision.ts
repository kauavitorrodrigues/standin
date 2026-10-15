import type { TileMeta } from "@standin/contracts";
import {
    WALL_COLLISION_CELLS,
    WALL_PAINT_ACTIONS,
    type WallPaintAction,
} from "../../../consts/wall";
import type { CanEditTile } from "../../../types/meta";
import { getWallTargets } from "./getWallTargets";

export type WallCell = { col: number; row: number };

const buildFullMask = (): boolean[][] =>
    Array.from({ length: WALL_COLLISION_CELLS }, () =>
        Array.from({ length: WALL_COLLISION_CELLS }, () => true)
    );

const isInside = ({ col, row }: WallCell): boolean =>
    col >= 0 &&
    col < WALL_COLLISION_CELLS &&
    row >= 0 &&
    row < WALL_COLLISION_CELLS;

const countSolid = (mask: boolean[][]): number =>
    mask.reduce((total, row) => total + row.filter(Boolean).length, 0);

// The cells of a wall tile that block, the whole tile when it has no mask.
export const resolveWallCollision = (meta: TileMeta, index: number) =>
    meta[String(index)]?.solidMask ?? buildFullMask();

// Paints cells of the collision of one wall tile, or erases them. A tile
// never loses its last solid cell, and a mask that blocks every cell is the
// same as no mask, so it is stored as none. A tile with a mask is solid.
export const paintWallCollision = (
    meta: TileMeta,
    index: number,
    cells: WallCell[],
    action: WallPaintAction,
    canEdit: CanEditTile
): TileMeta => {
    if (getWallTargets(meta, [index], canEdit).length === 0) return meta;

    const mask = resolveWallCollision(meta, index).map((row) => [...row]);
    const solid = action === WALL_PAINT_ACTIONS.PAINT;
    let solidLeft = countSolid(mask);
    let changed = false;

    for (const cell of cells) {
        if (!isInside(cell) || mask[cell.row][cell.col] === solid) continue;
        if (!solid && solidLeft <= 1) continue;
        mask[cell.row][cell.col] = solid;
        solidLeft += solid ? 1 : -1;
        changed = true;
    }
    if (!changed) return meta;

    const key = String(index);
    const { solidMask: _solidMask, ...rest } = meta[key];
    if (solidLeft === WALL_COLLISION_CELLS * WALL_COLLISION_CELLS) {
        return { ...meta, [key]: rest };
    }
    return { ...meta, [key]: { ...rest, solid: true, solidMask: mask } };
};

// Takes the collision mask off the tiles, so each blocks the whole tile.
export const clearWallCollision = (
    meta: TileMeta,
    indices: number[],
    canEdit: CanEditTile
): TileMeta => {
    const targets = getWallTargets(meta, indices, canEdit).filter(
        (index) => meta[String(index)].solidMask !== undefined
    );
    if (targets.length === 0) return meta;

    const next = { ...meta };
    for (const index of targets) {
        const { solidMask: _solidMask, ...rest } = meta[String(index)];
        next[String(index)] = rest;
    }
    return next;
};
