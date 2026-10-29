import { NEAREST_TILE } from "@/features/game/consts/click-move";
import type { Cell } from "@/features/game/types/cell";

export type NearestFreeTileSearch = {
    goal: Cell;
    // The way the avatar faces, tried first. Null skips it.
    direction: { x: number; y: number } | null;
    // How far around the goal the second search reaches, in tiles.
    radius?: number;
    // Whether an avatar can stand on the tile. A tile outside the map is not.
    isOpen: (cell: Cell) => boolean;
    // Tiles that are open but not for this avatar to go to, like a locked room
    // it may not enter.
    isExcluded?: (cell: Cell) => boolean;
    // Breaks the ties between tiles at the same distance.
    random?: () => number;
};

/**
 * The tile to walk to when the one that was asked for is closed. First the
 * tiles along the direction the avatar faces, starting next to the goal: the
 * first one that is open and not excluded wins, and a closed tile in between
 * does not end the search. Then the square of tiles around the goal: the open
 * ones sorted by their distance in tiles to the goal, with a little noise so
 * that tiles at the same distance do not always lose to the same one.
 */
export const findNearestFreeTile = ({
    goal,
    direction,
    radius = NEAREST_TILE.DEFAULT_RADIUS,
    isOpen,
    isExcluded = () => false,
    random = Math.random,
}: NearestFreeTileSearch): Cell | null => {
    const isFree = (cell: Cell) => isOpen(cell) && !isExcluded(cell);

    if (direction) {
        for (let step = 1; step <= NEAREST_TILE.LINE_MAX; step++) {
            const cell = {
                column: goal.column + direction.x * step,
                row: goal.row + direction.y * step,
            };
            if (isFree(cell)) return cell;
        }
    }

    const candidates: { cell: Cell; distance: number }[] = [];
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            const cell = { column: goal.column + dx, row: goal.row + dy };
            if (!isFree(cell)) continue;

            candidates.push({
                cell,
                distance: Math.abs(dx) + Math.abs(dy) + (random() - 0.5),
            });
        }
    }
    candidates.sort((a, b) => a.distance - b.distance);
    return candidates[0]?.cell ?? null;
};
