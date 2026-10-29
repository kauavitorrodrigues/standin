import { NEAREST_TILE } from "@/features/game/consts/click-move";
import type { Cell } from "@/features/game/types/cell";
import { findNearestFreeTile } from "@/features/game/utils/findNearestFreeTile";

type Point = { x: number; y: number };

export type WalkPlanSearch = {
    // The tile asked for, and the others to try, best first, when it cannot be
    // reached.
    goal: Cell;
    alternates: readonly Cell[];
    // The way the avatar faces, for the tile next to a closed goal.
    direction: Point | null;
    // The radius of the search around a closed goal.
    radius?: number;
    // Whether an avatar can stand on the tile.
    isOpen: (cell: Cell) => boolean;
    // Tiles that are open but not to be walked to (a locked room).
    isForbidden?: (cell: Cell) => boolean;
    // The tiles to walk from the start to the goal, or null with no way.
    findRoute: (goal: Cell) => Cell[] | null;
    random?: () => number;
};

export type WalkPlan = {
    route: Cell[];
    // The goals that were not tried yet, to plan again with if the walk is
    // blocked later.
    alternates: Cell[];
};

/**
 * Plans the walk to the first goal that has a way. A goal that is open and not
 * forbidden is tried as it is. If it is closed, forbidden or has no way, the
 * open tile closest to it is tried, never one in a forbidden room. Other
 * people are not in the way: avatars do not collide, so a tile with someone on
 * it is a tile like any other. Then the next goal of the list, and so on. Null
 * when none of them has a way.
 */
export const planWalk = ({
    goal,
    alternates,
    direction,
    radius = NEAREST_TILE.DEFAULT_RADIUS,
    isOpen,
    isForbidden = () => false,
    findRoute,
    random,
}: WalkPlanSearch): WalkPlan | null => {
    const goals = [goal, ...alternates];

    for (let index = 0; index < goals.length; index++) {
        const wanted = goals[index]!;
        const rest = goals.slice(index + 1);
        const tried: Cell[] = [];

        if (isOpen(wanted) && !isForbidden(wanted)) {
            const route = findRoute(wanted);
            if (route) return { route, alternates: rest };
            tried.push(wanted);
        }

        const near = findNearestFreeTile({
            goal: wanted,
            direction,
            radius,
            isOpen,
            // The goal itself is open when it was the way to it that failed.
            isExcluded: (cell) =>
                isForbidden(cell) ||
                tried.some(
                    ({ column, row }) =>
                        column === cell.column && row === cell.row
                ),
            random,
        });
        if (near) {
            const route = findRoute(near);
            if (route) return { route, alternates: rest };
        }
    }

    return null;
};
