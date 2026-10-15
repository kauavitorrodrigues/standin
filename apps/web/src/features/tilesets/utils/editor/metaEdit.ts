import type { TileMeta } from "@standin/contracts";
import type {
    CanEditTile,
    TileCategory,
    TileMetaEntry,
} from "../../types/meta";
import {
    canBeBlankDefault,
    canHaveTop,
    canHaveWallMeta,
} from "./categoryRules";
import { pickWallFields } from "./wall/wallFields";

const keyOf = (index: number) => String(index);

// Gives the tiles a category. What does not apply to the new category is
// dropped (a top and the fields of a wall piece only belong to a wall, a blank
// default to a floor or wall).
export const setTileCategory = (
    meta: TileMeta,
    indices: number[],
    category: TileCategory,
    canEdit: CanEditTile
): TileMeta => {
    const next = { ...meta };
    for (const index of indices.filter(canEdit)) {
        const current = meta[keyOf(index)];
        const entry: TileMetaEntry = { category };
        if (current?.solid) entry.solid = true;
        if (canHaveTop(category) && current?.top !== undefined) {
            entry.top = current.top;
        }
        if (canHaveWallMeta(category) && current) {
            Object.assign(entry, pickWallFields(current));
        }
        if (canBeBlankDefault(category) && current?.blankDefault) {
            entry.blankDefault = true;
        }
        next[keyOf(index)] = entry;
    }
    return next;
};

export const clearTileCategory = (
    meta: TileMeta,
    indices: number[],
    canEdit: CanEditTile
): TileMeta => {
    const next = { ...meta };
    for (const index of indices.filter(canEdit)) delete next[keyOf(index)];
    return next;
};

// Only a tile that has a category can be solid.
export const setTileSolid = (
    meta: TileMeta,
    indices: number[],
    solid: boolean,
    canEdit: CanEditTile
): TileMeta => {
    const next = { ...meta };
    for (const index of indices.filter(canEdit)) {
        const current = meta[keyOf(index)];
        if (!current) continue;
        const { solid: _solid, ...rest } = current;
        next[keyOf(index)] = solid ? { ...rest, solid: true } : rest;
    }
    return next;
};

// At most one tile of a category is the default of the blank map, so setting
// it takes it from the others of the same category.
export const setTileBlankDefault = (
    meta: TileMeta,
    index: number,
    on: boolean
): TileMeta => {
    const target = meta[keyOf(index)];
    if (!target || !canBeBlankDefault(target.category)) return meta;

    const next: TileMeta = {};
    for (const [key, entry] of Object.entries(meta)) {
        const { blankDefault, ...rest } = entry;
        const isTarget = key === keyOf(index);
        const sameCategory = entry.category === target.category;
        const keeps = isTarget ? on : blankDefault && !sameCategory;
        next[key] = keeps ? { ...rest, blankDefault: true } : rest;
    }
    return next;
};

// The tile drawn above a wall tile, or none.
export const setTileTop = (
    meta: TileMeta,
    index: number,
    top: number | null,
    canEdit: CanEditTile
): TileMeta => {
    const target = meta[keyOf(index)];
    if (!target || !canHaveTop(target.category) || !canEdit(index)) {
        return meta;
    }
    const { top: _top, ...rest } = target;
    return {
        ...meta,
        [keyOf(index)]: top === null ? rest : { ...rest, top },
    };
};

const sortKeys = (meta: TileMeta) =>
    Object.fromEntries(
        Object.entries(meta)
            .sort(([x], [y]) => Number(x) - Number(y))
            .map(([key, entry]) => [
                key,
                Object.fromEntries(
                    Object.entries(entry).sort(([x], [y]) => (x < y ? -1 : 1))
                ),
            ])
    );

export const isSameTileMeta = (a: TileMeta, b: TileMeta): boolean =>
    JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));
