import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssueCode,
} from "../../layout/issues";
import { findTileLayer } from "../../layout/ops/findTileLayer";
import type { PlacedAsset } from "../../render/render-payload.schema";
import { LAYOUT_AREA_FLOOR_LAYER_NAME } from "../../schemas/layout.schema";
import { STAMP_VERSION } from "../consts/limits";
import {
    STAMP_LAYER_ORDER,
    getMapLayerOfStampLayer,
} from "../consts/stamp-layer-order";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { BuildStampOpsResult } from "../types/build-stamp-ops-result";
import type { Cell } from "../types/cell";
import type { EditorModel } from "../types/editor-model";
import type { StampRect } from "../types/stamp-rect";
import { findAreaObjects } from "./findAreaObjects";
import { getAreaRefusal } from "./getAreaRefusal";
import { replayOps } from "./replayOps";
import { buildStampPaintOps } from "./stamp/buildStampPaintOps";
import { captureStampLayers } from "./stamp/captureStampLayers";
import { toLayoutLibrary } from "./toLayoutLibrary";

const isInside = (rect: StampRect, x: number, y: number): boolean =>
    x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;

// The tiles that hold something, by layer, in the cells of the rectangle that
// are not in `keep`.
const buildClearOps = (
    model: EditorModel,
    rect: StampRect,
    keep: StampRect
): EditorOp[] => {
    const ops: EditorOp[] = [];

    for (const layerName of STAMP_LAYER_ORDER) {
        const mapLayer = getMapLayerOfStampLayer(layerName);
        const layer = findTileLayer(model.layout, mapLayer);
        if (!layer) continue;

        const cells: Cell[] = [];
        for (let y = rect.y; y < rect.y + rect.h; y++) {
            for (let x = rect.x; x < rect.x + rect.w; x++) {
                if (isInside(keep, x, y)) continue;
                if (layer.data[y * model.layout.width + x]) cells.push([x, y]);
            }
        }
        if (cells.length > 0) {
            ops.push({ type: "erase", layer: mapLayer, cells });
        }
    }
    return ops;
};

// The objects of the area go by the same distance as the area. The ones ahead
// in the direction of the move go first, so none lands on another that has not
// moved yet. A surface item follows its parent.
const buildObjectOps = (
    objects: readonly PlacedAsset[],
    deltaX: number,
    deltaY: number
): EditorOp[] => {
    const progress = (tileX: number, tileY: number) =>
        tileX * Math.sign(deltaX) + tileY * Math.sign(deltaY);

    return [...objects]
        .sort((a, b) => progress(b.tileX, b.tileY) - progress(a.tileX, a.tileY))
        .map((object) => ({
            type: "move_asset" as const,
            id: object.id,
            tileX: object.tileX + deltaX,
            tileY: object.tileY + deltaY,
        }));
};

const describeRefusal = (code: LayoutIssueCode): string => {
    switch (code) {
        case Code.STAMP_OUT_OF_BOUNDS:
            return Messages.stampOutOfBounds;
        case Code.STAMP_COVERS_SPAWN:
            return Messages.stampCoversSpawn;
        case Code.STAMP_OVERLAPS_AREA:
            return Messages.stampOverlapsArea;
        default:
            return Messages.stampAreaNotEmpty;
    }
};

/**
 * The operations that carry an area with everything inside it (tiles of the
 * four layers and the objects) from one rectangle to another of the same
 * size. The zone op itself is not included. The target must be inside the
 * map, must not cover the spawn, another area or an object that is not the
 * area's own; any refusal comes back as errors and changes nothing.
 *
 * The target is cleared and painted first, then the objects move, and only
 * then is the old place cleared, because a wall cannot be erased while an
 * object is mounted on it. The ground of the map is not touched: the floor of
 * the area is on its own layer, so the old place shows the map again.
 */
export const buildZoneMoveOps = (
    model: EditorModel,
    zoneId: number,
    from: StampRect,
    to: StampRect
): BuildStampOpsResult => {
    const objects = findAreaObjects(model, from);
    const moving = new Set(objects.map(({ id }) => id));
    for (const { id, parentId } of model.placed) {
        if (parentId !== null && moving.has(parentId)) moving.add(id);
    }

    const refusal = getAreaRefusal(model, to, { zoneId, ignoreIds: moving });
    if (refusal) {
        return {
            ok: false,
            errors: [createIssue(refusal, "zone", describeRefusal(refusal))],
        };
    }

    const captured = captureStampLayers(
        model,
        toLayoutLibrary(model.library, model.usedTilesets),
        from,
        LAYOUT_AREA_FLOOR_LAYER_NAME
    );
    const ops: EditorOp[] = [
        ...buildClearOps(model, to, from),
        ...buildStampPaintOps(
            {
                version: STAMP_VERSION,
                width: from.w,
                height: from.h,
                palette: captured.palette,
                layers: captured.layers,
                objects: [],
                zone: null,
            },
            to.x,
            to.y
        ),
        ...buildObjectOps(objects, to.x - from.x, to.y - from.y),
        ...buildClearOps(model, from, to),
    ];

    const replay = replayOps(model, ops);
    if (!replay.ok) return { ok: false, errors: replay.errors };
    return { ok: true, ops, model: replay.model };
};
