import { TILE_SIZE } from "../../../consts/constants";
import {
    LAYOUT_ZONE_KINDS,
    type LayoutObject,
} from "../../../schemas/layout.schema";
import { isZoneObject, objectToZone } from "../../../layout/zone";
import type { ZoneInput } from "../../schemas/editorOp.schema";

const isTileAligned = (value: number): boolean => value % TILE_SIZE === 0;

/**
 * The zone in tiles that rebuilds this layout object exactly, or null when the
 * object is not a spawn or an area the editor can write back (another kind,
 * not aligned to the grid, rotated, polygon, key, target or custom name).
 */
export const layoutObjectToZoneInput = (
    object: LayoutObject
): ZoneInput | null => {
    if (!isZoneObject(object)) return null;

    const zone = objectToZone(object);
    const isEditable =
        zone.kind === LAYOUT_ZONE_KINDS.SPAWN ||
        zone.kind === LAYOUT_ZONE_KINDS.AREA;
    const isPlain =
        zone.polygon === undefined &&
        (zone.rotation ?? 0) === 0 &&
        zone.key === undefined &&
        zone.targetX === undefined &&
        zone.targetY === undefined &&
        (zone.name === undefined || zone.name === zone.kind);
    const isAligned = [zone.x, zone.y, zone.width, zone.height].every(
        isTileAligned
    );
    if (!isEditable || !isPlain || !isAligned) return null;

    return {
        id: object.id,
        kind: zone.kind as ZoneInput["kind"],
        rect: {
            x: zone.x / TILE_SIZE,
            y: zone.y / TILE_SIZE,
            w: zone.width / TILE_SIZE,
            h: zone.height / TILE_SIZE,
        },
        ...(zone.label === undefined ? {} : { label: zone.label }),
    };
};
