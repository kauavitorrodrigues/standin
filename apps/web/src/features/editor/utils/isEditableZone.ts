import { LAYOUT_ZONE_KINDS, TILE_SIZE, type Zone } from "@standin/contracts";

const isAligned = (value: number): boolean => value % TILE_SIZE === 0;

// A zone the editor can move, resize and rename: a spawn or an area with an
// id, on the grid, not rotated and without a polygon. Anything else (a door,
// a custom zone) is drawn but left alone, as set_zone cannot write it back.
export const isEditableZone = (zone: Zone): boolean => {
    if (zone.id === undefined) return false;
    if (zone.polygon !== undefined || (zone.rotation ?? 0) !== 0) return false;

    const isKnownKind =
        zone.kind === LAYOUT_ZONE_KINDS.SPAWN ||
        zone.kind === LAYOUT_ZONE_KINDS.AREA;
    if (!isKnownKind) return false;

    return [zone.x, zone.y, zone.width, zone.height].every(isAligned);
};
