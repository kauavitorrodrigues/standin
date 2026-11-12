import { TELEPORT } from "@/features/game/consts/click-move";
import type { Cell } from "@/features/game/types/cell";

export type TeleportSearch = {
    // The tile that was clicked and the tile the avatar is on.
    goal: Cell;
    origin: Cell;
    // The farthest jump, in tiles.
    maxDistance?: number;
    // Whether an avatar can stand on the tile.
    isOpen: (cell: Cell) => boolean;
    // Tiles that are open but not to be entered (a locked room, a desk of
    // somebody else).
    isForbidden: (cell: Cell) => boolean;
};

/**
 * The tile to jump to when a walk has no way: the one that was clicked, and
 * only that one. It has to be open, outside what is forbidden and within the
 * maximum distance (inclusive). It is never swapped for a tile nearby, the
 * walk has already tried those. Null when the jump is not allowed or the
 * avatar is already there.
 */
export const planTeleport = ({
    goal,
    origin,
    maxDistance = TELEPORT.MAX_DISTANCE_TILES,
    isOpen,
    isForbidden,
}: TeleportSearch): Cell | null => {
    const distance = Math.hypot(
        goal.column - origin.column,
        goal.row - origin.row
    );
    if (distance === 0) return null;
    if (distance > maxDistance) return null;
    if (!isOpen(goal)) return null;
    if (isForbidden(goal)) return null;
    return goal;
};
