import { TILE_SIZE } from "../../../consts/constants";
import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import { isZoneObject, objectToZone } from "../../../layout/zone";
import { LAYOUT_ZONE_KINDS } from "../../../schemas/layout.schema";
import type { EditorModel } from "../../types/editor-model";
import type { StampRect } from "../../types/stamp-rect";

/** True when a spawn zone of the map touches the rectangle. */
export const overlapsSpawn = (model: EditorModel, rect: StampRect): boolean =>
    (findZonesGroup(model.layout)?.objects ?? [])
        .filter(isZoneObject)
        .map(objectToZone)
        .filter(({ kind }) => kind === LAYOUT_ZONE_KINDS.SPAWN)
        .some(
            (zone) =>
                zone.x < (rect.x + rect.w) * TILE_SIZE &&
                rect.x * TILE_SIZE < zone.x + zone.width &&
                zone.y < (rect.y + rect.h) * TILE_SIZE &&
                rect.y * TILE_SIZE < zone.y + zone.height
        );
