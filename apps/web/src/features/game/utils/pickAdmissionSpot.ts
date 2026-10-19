import { TILE_SIZE } from "@standin/contracts";
import { CENTER_POSITION_DIVISOR } from "@/features/game/consts/map-geometry";
import type { GameRoom, GameRoomDoor } from "@/features/game/types/room";
import type { SeatArea, SeatSpot } from "@/features/game/utils/buildSeatAreas";
import type { AvatarBody } from "@/features/game/utils/getAvatarBodyRect";
import { isPositionBlocked } from "@/features/game/utils/findNearestFreeCell";
import { findNearestSeat } from "@/features/game/utils/findNearestSeat";
import { isInsideRoom } from "@/features/game/utils/getRoomAt";
import type { PlacedRect } from "@/features/game/utils/placed";
import { getCellKey, type WallCells } from "@/features/game/utils/wallCells";

type Point = { x: number; y: number };

export type AdmissionSpot =
    { kind: "seat"; seat: SeatSpot } | { kind: "cell"; x: number; y: number };

export type AdmissionInput = {
    room: GameRoom;
    // Where the admitted avatar is now, to pick the seat closest to it.
    point: Point;
    seatAreas: readonly SeatArea[];
    isTaken: (seat: SeatSpot) => boolean;
    solidRects: readonly PlacedRect[];
    // The body of the avatar, so it does not rest touching a solid.
    body: AvatarBody;
    // The cells with a wall tile, which are not floor even when not solid.
    wallCells: WallCells;
    // The doors of the map, to stay a tile away from them.
    doors: readonly GameRoomDoor[];
};

type Cell = { column: number; row: number; center: Point };

const getRoomCells = (room: GameRoom): Cell[] => {
    const firstColumn = Math.floor(room.x / TILE_SIZE);
    const lastColumn = Math.ceil((room.x + room.width) / TILE_SIZE);
    const firstRow = Math.floor(room.y / TILE_SIZE);
    const lastRow = Math.ceil((room.y + room.height) / TILE_SIZE);

    const cells: Cell[] = [];
    for (let row = firstRow; row < lastRow; row++) {
        for (let column = firstColumn; column < lastColumn; column++) {
            const center = {
                x: (column + 0.5) * TILE_SIZE,
                y: (row + 0.5) * TILE_SIZE,
            };
            if (isInsideRoom(room, center)) cells.push({ column, row, center });
        }
    }
    return cells;
};

// Whether the cell is within one tile of a door, doorway included.
const isNearDoor = (cell: Cell, doors: readonly GameRoomDoor[]): boolean =>
    doors.some(
        (door) =>
            cell.center.x > door.x - TILE_SIZE &&
            cell.center.x < door.x + door.width + TILE_SIZE &&
            cell.center.y > door.y - TILE_SIZE &&
            cell.center.y < door.y + door.height + TILE_SIZE
    );

const getRoomCenter = (room: GameRoom): Point => ({
    x: room.x + room.width / CENTER_POSITION_DIVISOR,
    y: room.y + room.height / CENTER_POSITION_DIVISOR,
});

const byDistanceTo =
    (target: Point) =>
        (a: Cell, b: Cell): number =>
            Math.hypot(a.center.x - target.x, a.center.y - target.y) -
        Math.hypot(b.center.x - target.x, b.center.y - target.y);

// The free cell nearest to the room center, since the avatar comes from
// outside and the rim of the room is where the walls and the doors are. Cells
// on a wall tile or beside a door are left out, and only when no other cell is
// left they come back, so the room never turns the user away.
const findRoomCell = ({
    room,
    solidRects,
    body,
    wallCells,
    doors,
}: AdmissionInput): Point | null => {
    const free = getRoomCells(room).filter(
        (cell) => !isPositionBlocked(cell.center, body, solidRects)
    );
    const onFloor = free.filter(
        (cell) => !wallCells.has(getCellKey(cell.column, cell.row))
    );
    const awayFromDoors = onFloor.filter((cell) => !isNearDoor(cell, doors));
    const tiers = [awayFromDoors, onFloor, free];
    const candidates = tiers.find((tier) => tier.length > 0);
    if (!candidates) return null;

    const [best] = [...candidates].sort(byDistanceTo(getRoomCenter(room)));
    return best ? best.center : null;
};

/**
 * Where an admitted avatar goes in the room: the free seat inside the room
 * closest to it (same tie rule as the seat code), or else the free floor cell
 * nearest to the center of the room, away from walls and doors. Null when the
 * room has neither.
 */
export const pickAdmissionSpot = (
    input: AdmissionInput
): AdmissionSpot | null => {
    const freeSeats = input.seatAreas
        .flatMap((area) => area.seats)
        .filter((seat) => isInsideRoom(input.room, seat))
        .filter((seat) => !input.isTaken(seat));
    const seat = findNearestSeat(freeSeats, input.point);
    if (seat) return { kind: "seat", seat };

    const cell = findRoomCell(input);
    if (!cell) return null;

    return { kind: "cell", x: cell.x, y: cell.y };
};
