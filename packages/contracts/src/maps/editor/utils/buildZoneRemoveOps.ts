import { findTileLayer } from "../../layout/ops/findTileLayer";
import {
    STAMP_LAYER_ORDER,
    getMapLayerOfStampLayer,
} from "../consts/stamp-layer-order";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { Cell } from "../types/cell";
import type { EditorModel } from "../types/editor-model";
import type { StampRect } from "../types/stamp-rect";
import { findAreaObjects } from "./findAreaObjects";
import { getClaimedDesk } from "./getClaimedDesk";
import { rectCells } from "./rectCells";

export type BuildZoneRemoveOpsResult =
    | { ok: true; ops: EditorOp[] }
    // Desks with an owner inside the area. They are not removed here.
    | { ok: false; claimedIds: string[] };

/**
 * The operations that delete an area with everything in it: the objects, the
 * tiles of the four layers and the zone. The ground of the map stays, because
 * the floor of the area is on its own layer. An area that holds a claimed desk is not
 * removed.
 */
export const buildZoneRemoveOps = (
    model: EditorModel,
    zoneId: number,
    rect: StampRect
): BuildZoneRemoveOpsResult => {
    const objects = findAreaObjects(model, rect);
    const claimedIds = objects
        .filter(({ id }) => getClaimedDesk(model, id) !== undefined)
        .map(({ id }) => id);
    if (claimedIds.length > 0) return { ok: false, claimedIds };

    const ops: EditorOp[] = objects.map(({ id }) => ({
        type: "remove_asset" as const,
        id,
    }));

    const all = rectCells(
        [rect.x, rect.y],
        [rect.x + rect.w - 1, rect.y + rect.h - 1]
    );
    for (const layerName of STAMP_LAYER_ORDER) {
        const mapLayer = getMapLayerOfStampLayer(layerName);
        const layer = findTileLayer(model.layout, mapLayer);
        if (!layer) continue;

        const cells: Cell[] = all.filter(
            ([x, y]) => layer.data[y * model.layout.width + x] !== 0
        );
        if (cells.length > 0) {
            ops.push({ type: "erase", layer: mapLayer, cells });
        }
    }
    ops.push({ type: "remove_zone", zoneId });

    return { ok: true, ops };
};
