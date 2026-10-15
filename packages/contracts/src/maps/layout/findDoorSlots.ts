import { DOOR_SIDES } from "../../assets/consts/door";
import { TILE_SIZE } from "../consts/constants";
import { LAYOUT_ZONE_KINDS } from "../schemas/layout.schema";
import { cellKey } from "./readWallCells";
import type { Zone } from "./zone";

export type DoorSide = (typeof DOOR_SIDES)[keyof typeof DOOR_SIDES];

export type DoorSlot = {
    roomKey: string;
    // The side of the room whose wall holds the gap.
    side: DoorSide;
    // Bottom left cell of the door footprint, same meaning as a placed object.
    tileX: number;
    tileY: number;
    width: number;
    height: number;
};

export type FindDoorSlotsInput = {
    zones: readonly Zone[];
    wallCells: ReadonlySet<string>;
    // The footprint of the door for each side. A door on a vertical wall can be
    // a rotated variant with another footprint.
    sizeBySide: Record<DoorSide, { w: number; h: number }>;
    // Cells already covered by placed doors or objects, as "column,row" keys.
    occupiedCells?: ReadonlySet<string>;
    mapColumns: number;
    mapRows: number;
};

type Bounds = { left: number; top: number; right: number; bottom: number };

// One side of a room: the cells of its border line, in order along the wall.
type SideLine = {
    side: DoorSide;
    // Cell of the line at an index along the wall.
    cellAt: (index: number) => { column: number; row: number };
    length: number;
    // Whether the line runs along columns (north and south walls).
    horizontal: boolean;
};

const SIDE_ORDER: DoorSide[] = [
    DOOR_SIDES.NORTH,
    DOOR_SIDES.EAST,
    DOOR_SIDES.SOUTH,
    DOOR_SIDES.WEST,
];

// The line of a side can sit on the zone edge or one cell away from it.
const LINE_SHIFTS = [0, -1, 1];

export const findDoorSlots = (input: FindDoorSlotsInput): DoorSlot[] => {
    const slots = input.zones
        .filter(isRoom)
        .flatMap((zone) => findRoomSlots(zone, input))
        .filter((slot) => isInsideMap(slot, input));

    return slots.sort(compareSlots);
};

const isRoom = (zone: Zone): boolean =>
    zone.kind === LAYOUT_ZONE_KINDS.PRIVATE && zone.key !== undefined;

const getBounds = (zone: Zone): Bounds => {
    const left = Math.round(zone.x / TILE_SIZE);
    const top = Math.round(zone.y / TILE_SIZE);

    return {
        left,
        top,
        right: left + Math.round(zone.width / TILE_SIZE) - 1,
        bottom: top + Math.round(zone.height / TILE_SIZE) - 1,
    };
};

const getSideLine = (
    side: DoorSide,
    bounds: Bounds,
    shift: number
): SideLine => {
    const columns = bounds.right - bounds.left + 1;
    const rows = bounds.bottom - bounds.top + 1;

    switch (side) {
        case DOOR_SIDES.NORTH:
            return {
                side,
                horizontal: true,
                length: columns,
                cellAt: (index) => ({
                    column: bounds.left + index,
                    row: bounds.top + shift,
                }),
            };
        case DOOR_SIDES.SOUTH:
            return {
                side,
                horizontal: true,
                length: columns,
                cellAt: (index) => ({
                    column: bounds.left + index,
                    row: bounds.bottom + shift,
                }),
            };
        case DOOR_SIDES.WEST:
            return {
                side,
                horizontal: false,
                length: rows,
                cellAt: (index) => ({
                    column: bounds.left + shift,
                    row: bounds.top + index,
                }),
            };
        case DOOR_SIDES.EAST:
            return {
                side,
                horizontal: false,
                length: rows,
                cellAt: (index) => ({
                    column: bounds.right + shift,
                    row: bounds.top + index,
                }),
            };
    }
};

const countWalls = (line: SideLine, wallCells: ReadonlySet<string>): number => {
    let count = 0;
    for (let index = 0; index < line.length; index++) {
        const { column, row } = line.cellAt(index);
        if (wallCells.has(cellKey(column, row))) count++;
    }

    return count;
};

// Of the three parallel lines, the one with the most wall cells. A tie keeps
// the zone edge first. Null when no line has a wall at all.
const findWallLine = (
    side: DoorSide,
    bounds: Bounds,
    wallCells: ReadonlySet<string>
): SideLine | null => {
    let best: SideLine | null = null;
    let bestCount = 0;

    for (const shift of LINE_SHIFTS) {
        const line = getSideLine(side, bounds, shift);
        const count = countWalls(line, wallCells);
        if (count > bestCount) {
            best = line;
            bestCount = count;
        }
    }

    return best;
};

type Gap = { start: number; length: number };

// Maximal runs of cells without a wall, bounded by walls or the room corner.
const findGaps = (line: SideLine, wallCells: ReadonlySet<string>): Gap[] => {
    const isWall = (index: number) => {
        const { column, row } = line.cellAt(index);

        return wallCells.has(cellKey(column, row));
    };
    const gaps: Gap[] = [];
    let start = -1;

    for (let index = 0; index <= line.length; index++) {
        const open = index < line.length && !isWall(index);
        if (open && start < 0) start = index;
        if (!open && start >= 0) {
            gaps.push({ start, length: index - start });
            start = -1;
        }
    }

    return gaps;
};

// Offsets inside a gap where a door of this length goes. One door is centered,
// a gap with room for two gets one at each end.
const getOffsets = (gapLength: number, doorLength: number): number[] => {
    if (gapLength < doorLength) return [];
    if (gapLength < doorLength * 2) {
        return [Math.floor((gapLength - doorLength) / 2)];
    }

    return [0, gapLength - doorLength];
};

const findRoomSlots = (zone: Zone, input: FindDoorSlotsInput): DoorSlot[] => {
    const bounds = getBounds(zone);

    return SIDE_ORDER.flatMap((side) => {
        const line = findWallLine(side, bounds, input.wallCells);
        if (!line) return [];

        const size = input.sizeBySide[side];
        const along = line.horizontal ? size.w : size.h;

        return findGaps(line, input.wallCells).flatMap((gap) =>
            getOffsets(gap.length, along).map((offset) =>
                buildSlot(zone.key as string, line, gap.start + offset, size)
            )
        );
    }).filter((slot) => !isOccupied(slot, input.occupiedCells));
};

// The first cell of the door along the wall sits on the line. A door across a
// horizontal wall stands on the line with its bottom row and rises above it.
const buildSlot = (
    roomKey: string,
    line: SideLine,
    index: number,
    size: { w: number; h: number }
): DoorSlot => {
    const first = line.cellAt(index);
    const tileY = line.horizontal ? first.row : first.row + size.h - 1;

    return {
        roomKey,
        side: line.side,
        tileX: first.column,
        tileY,
        width: size.w,
        height: size.h,
    };
};

const isOccupied = (
    slot: DoorSlot,
    occupiedCells: ReadonlySet<string> | undefined
): boolean => {
    if (!occupiedCells || occupiedCells.size === 0) return false;
    for (let dx = 0; dx < slot.width; dx++) {
        for (let dy = 0; dy < slot.height; dy++) {
            if (occupiedCells.has(cellKey(slot.tileX + dx, slot.tileY - dy))) {
                return true;
            }
        }
    }

    return false;
};

const isInsideMap = (slot: DoorSlot, input: FindDoorSlotsInput): boolean =>
    slot.tileX >= 0 &&
    slot.tileY - slot.height + 1 >= 0 &&
    slot.tileX + slot.width <= input.mapColumns &&
    slot.tileY < input.mapRows;

const compareSlots = (a: DoorSlot, b: DoorSlot): number => {
    if (a.roomKey !== b.roomKey) return a.roomKey < b.roomKey ? -1 : 1;
    const bySide = SIDE_ORDER.indexOf(a.side) - SIDE_ORDER.indexOf(b.side);
    if (bySide !== 0) return bySide;
    if (a.tileY !== b.tileY) return a.tileY - b.tileY;

    return a.tileX - b.tileX;
};
