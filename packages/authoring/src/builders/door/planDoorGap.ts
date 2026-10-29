import { DOOR_SIDES, TILE_SIZE } from "@standin/contracts";
import type { Cell, DoorSide } from "@standin/contracts";
import type { DoorGap, TileSize, ZoneBox } from "../../types";

// The cell of the wall line at an index along the side. The line is the zone
// edge, the one findDoorSlots looks for walls on.
const getLineCell = (
    side: DoorSide,
    edges: { left: number; top: number; right: number; bottom: number },
    along: number
): Cell => {
    switch (side) {
        case DOOR_SIDES.NORTH:
            return [edges.left + along, edges.top];
        case DOOR_SIDES.SOUTH:
            return [edges.left + along, edges.bottom];
        case DOOR_SIDES.WEST:
            return [edges.left, edges.top + along];
        case DOOR_SIDES.EAST:
            return [edges.right, edges.top + along];
        default:
            return side satisfies never;
    }
};

/**
 * The cells of the wall the door takes and the anchor a slot there has, same
 * meaning as findDoorSlots: the zone edge, with the bottom row of a door on a
 * side wall.
 */
export const planDoorGap = (
    zone: ZoneBox,
    side: DoorSide,
    size: TileSize,
    offset: number | undefined
): DoorGap => {
    const left = Math.round(zone.x / TILE_SIZE);
    const top = Math.round(zone.y / TILE_SIZE);
    const columns = Math.round(zone.width / TILE_SIZE);
    const rows = Math.round(zone.height / TILE_SIZE);
    const edges = {
        left,
        top,
        right: left + columns - 1,
        bottom: top + rows - 1,
    };

    const horizontal = side === DOOR_SIDES.NORTH || side === DOOR_SIDES.SOUTH;
    const length = horizontal ? columns : rows;
    const span = horizontal ? size.w : size.h;
    const start = offset ?? Math.floor((length - span) / 2);

    const cells = Array.from({ length: span }, (_, i) =>
        getLineCell(side, edges, start + i)
    );
    const first = cells[0] as Cell;

    return {
        cells,
        tileX: first[0],
        tileY: horizontal ? first[1] : first[1] + size.h - 1,
    };
};
