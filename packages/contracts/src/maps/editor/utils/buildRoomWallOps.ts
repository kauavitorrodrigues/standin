import { TILE_SIZE } from "../../consts/constants";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../layout/issues";
import { chunkCells } from "./chunkCells";
import { MAX_CELLS_PER_OP } from "../consts/limits";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { Cell } from "../types/cell";

// Smallest side of a room that can have an outline of walls, in tiles. With
// less, the front wall would sit on the back wall.
export const ROOM_WALLS_MIN_TILES = 3;

type RoomRect = { x: number; y: number; width: number; height: number };

type RoomWallOps =
    { ok: true; ops: EditorOp[] } | { ok: false; errors: LayoutIssue[] };

// The cells on the border of the room, in tiles. The line sits on the zone
// edge, the same line `findDoorSlots` looks for walls on, so the doors find
// the gaps and the thin traces of the side walls fall on the edge of the zone.
export const getRoomOutlineCells = (room: RoomRect): Cell[] => {
    const left = Math.round(room.x / TILE_SIZE);
    const top = Math.round(room.y / TILE_SIZE);
    const right = left + Math.round(room.width / TILE_SIZE) - 1;
    const bottom = top + Math.round(room.height / TILE_SIZE) - 1;
    const cells: Cell[] = [];

    for (let column = left; column <= right; column++) {
        for (let row = top; row <= bottom; row++) {
            const onBorder =
                column === left ||
                column === right ||
                row === top ||
                row === bottom;
            if (onBorder) cells.push([column, row]);
        }
    }

    return cells;
};

/**
 * The operations that draw the walls of a room in one style: a paint of the
 * outline of the zone with a tile of the style. The piece of each cell is the
 * one its neighbors ask for, so the style only has to be complete. The step
 * is one undo as long as the outline fits in a single operation.
 */
export const buildRoomWallOps = (
    room: RoomRect,
    tilesetId: string,
    tileIndex: number
): RoomWallOps => {
    const columns = Math.round(room.width / TILE_SIZE);
    const rows = Math.round(room.height / TILE_SIZE);
    if (columns < ROOM_WALLS_MIN_TILES || rows < ROOM_WALLS_MIN_TILES) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.ROOM_TOO_SMALL_FOR_WALLS,
                    "zone",
                    Messages.roomTooSmallForWalls
                ),
            ],
        };
    }

    return {
        ok: true,
        ops: chunkCells(getRoomOutlineCells(room), MAX_CELLS_PER_OP).map(
            (cells) => ({
                type: "paint",
                layer: "walls",
                tilesetId,
                tileIndex,
                cells,
            })
        ),
    };
};
