import { resolveGid } from "../../layout/gid";
import { findTileLayer } from "../../layout/ops/findTileLayer";
import { LAYOUT_AREA_FLOOR_LAYER_NAME } from "../../schemas/layout.schema";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { Cell } from "../types/cell";
import type { EditorModel } from "../types/editor-model";
import type { StampRect } from "../types/stamp-rect";
import { canPlaceAsset } from "./canPlaceAsset";
import { chunkCells } from "./chunkCells";
import { toLayoutLibrary } from "./toLayoutLibrary";

type FloorTile = { tilesetId: string; tileIndex: number };

const isInside = (rect: StampRect, x: number, y: number): boolean =>
    x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;

const listCells = (
    rect: StampRect,
    keep: (x: number, y: number) => boolean
): Cell[] => {
    const cells: Cell[] = [];
    for (let y = rect.y; y < rect.y + rect.h; y++) {
        for (let x = rect.x; x < rect.x + rect.w; x++) {
            if (keep(x, y)) cells.push([x, y]);
        }
    }
    return cells;
};

// The floor tile of the area that fills most of the rectangle, or null when it has none.
export const findZoneFloorTile = (
    model: EditorModel,
    rect: StampRect
): FloorTile | null => {
    const ground = findTileLayer(model.layout, LAYOUT_AREA_FLOOR_LAYER_NAME);
    if (!ground) return null;

    const library = toLayoutLibrary(model.library, model.usedTilesets);
    const counts = new Map<string, { tile: FloorTile; count: number }>();
    for (const [x, y] of listCells(rect, () => true)) {
        const tile = resolveGid(
            model.layout,
            library,
            ground.data[y * model.layout.width + x]
        );
        if (!tile) continue;

        const key = `${tile.tilesetId}:${tile.tileIndex}`;
        const entry = counts.get(key) ?? { tile, count: 0 };
        entry.count += 1;
        counts.set(key, entry);
    }

    let best: { tile: FloorTile; count: number } | null = null;
    for (const entry of counts.values()) {
        if (!best || entry.count > best.count) best = entry;
    }
    return best?.tile ?? null;
};

// The floor of the area follows the rectangle: new cells get the floor the
// area has most of and cells that leave it lose theirs. It is all on the floor
// layer of the areas, so the ground of the map is never touched.
const buildFloorOps = (
    model: EditorModel,
    from: StampRect,
    to: StampRect
): EditorOp[] => {
    const floor = findZoneFloorTile(model, from);
    const ground = findTileLayer(model.layout, LAYOUT_AREA_FLOOR_LAYER_NAME);
    if (!floor || !ground) return [];

    const library = toLayoutLibrary(model.library, model.usedTilesets);
    const at = (x: number, y: number) =>
        resolveGid(
            model.layout,
            library,
            ground.data[y * model.layout.width + x]
        );

    const added = listCells(to, (x, y) => !isInside(from, x, y)).filter(
        ([x, y]) => at(x, y) === null
    );
    const removed = listCells(from, (x, y) => !isInside(to, x, y)).filter(
        ([x, y]) => at(x, y) !== null
    );

    const ops: EditorOp[] = [];
    for (const cells of chunkCells(removed)) {
        ops.push({
            type: "erase",
            layer: LAYOUT_AREA_FLOOR_LAYER_NAME,
            cells,
        });
    }
    for (const cells of chunkCells(added)) {
        ops.push({
            type: "paint_tiles",
            layer: LAYOUT_AREA_FLOOR_LAYER_NAME,
            tiles: [{ ...floor, cells }],
        });
    }
    return ops;
};

// Objects that sit (even partly) in the rectangle but would end up outside the
// new one go to the nearest free anchor inside it. One that finds no place
// stays where it is. Surface items follow their parent, so only roots move.
const buildObjectOps = (
    model: EditorModel,
    from: StampRect,
    to: StampRect
): EditorOp[] => {
    const assets = new Map(model.library.assets.map((a) => [a.id, a]));
    const ops: EditorOp[] = [];
    let working = model;

    const roots = model.placed.filter(({ parentId }) => parentId === null);
    for (const object of roots) {
        const asset = assets.get(object.assetId);
        if (!asset) continue;

        const { w, h } = asset.footprint;
        const left = object.tileX;
        const top = object.tileY - h + 1;
        const wasInside = isInside(from, left, top);
        const isOut =
            left < to.x ||
            top < to.y ||
            left + w > to.x + to.w ||
            top + h > to.y + to.h;
        if (!wasInside || !isOut) continue;

        const candidates: Cell[] = [];
        for (let x = to.x; x + w <= to.x + to.w; x++) {
            for (let y = to.y + h - 1; y < to.y + to.h; y++) {
                candidates.push([x, y]);
            }
        }
        const distance = ([x, y]: Cell) =>
            Math.abs(x - object.tileX) + Math.abs(y - object.tileY);
        candidates.sort((a, b) => distance(a) - distance(b));

        const target = candidates.find(
            ([x, y]) =>
                canPlaceAsset(working, asset, x, y, { ignoreId: object.id }).ok
        );
        if (!target) continue;

        const op: EditorOp = {
            type: "move_asset",
            id: object.id,
            tileX: target[0],
            tileY: target[1],
            offsetX: 0,
            offsetY: 0,
        };
        ops.push(op);
        working = {
            ...working,
            placed: working.placed.map((item) =>
                item.id === object.id
                    ? { ...item, tileX: target[0], tileY: target[1] }
                    : item
            ),
        };
    }
    return ops;
};

/**
 * The operations that go with resizing an area zone from one rectangle to
 * another: the floor of the area grows or shrinks with it, and objects that
 * would fall outside move to the nearest free spot inside. The zone op itself
 * is not included.
 */
export const buildZoneResizeOps = (
    model: EditorModel,
    from: StampRect,
    to: StampRect
): EditorOp[] => [
    ...buildFloorOps(model, from, to),
    ...buildObjectOps(model, from, to),
];

/**
 * The operations that repaint the whole floor of an area with one tile, so
 * the area gets a single pattern.
 */
export const buildZoneFloorOps = (
    rect: StampRect,
    tile: FloorTile
): EditorOp[] =>
    chunkCells(listCells(rect, () => true)).map((cells) => ({
        type: "paint_tiles" as const,
        layer: LAYOUT_AREA_FLOOR_LAYER_NAME,
        tiles: [{ ...tile, cells }],
    }));
