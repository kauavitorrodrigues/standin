import { PATH_SEARCH, STAND_OFFSETS } from "@/features/game/consts/click-move";
import { MinHeap } from "@/features/game/utils/MinHeap";
import { getCellCenter } from "@/features/game/utils/cell";
import type { Cell } from "@/features/game/types/cell";

type Point = { x: number; y: number };

export type PathSearch = {
    // The tile the avatar stands on.
    start: Cell;
    goal: Cell;
    columns: number;
    rows: number;
    // Whether an avatar with its feet on the point fits there, in px.
    isFree: (point: Point) => boolean;
};

// The four cardinal directions, the same ones the keys walk. The fifth state
// of a tile is "arrived with no direction yet", only the start has it.
const DIRECTIONS = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
] as const;
const NO_DIRECTION = DIRECTIONS.length;
const STATES_PER_TILE = DIRECTIONS.length + 1;

/**
 * The point where the avatar stands on the tile: the center, or when the body
 * does not fit there the closest point around it where it does. Null when the
 * tile is closed.
 */
export const getStandingPoint = (
    cell: Cell,
    isFree: (point: Point) => boolean
): Point | null => {
    const center = getCellCenter(cell);
    for (const offset of STAND_OFFSETS) {
        const point = { x: center.x + offset.x, y: center.y + offset.y };
        if (isFree(point)) return point;
    }
    return null;
};

type StepCheck = {
    // The feet of the avatar before the step, in px.
    from: Point;
    to: Cell;
    columns: number;
    rows: number;
    isFree: (point: Point) => boolean;
};

/**
 * Where the avatar ends if it steps onto the tile, or null when it cannot: the
 * tile is outside the map, or closed, or a solid sits halfway to it, so a thin
 * solid between two open tiles still blocks the step. The walk and the search
 * use this same check, so a way found is a way that can be walked.
 */
export const findStep = ({
    from,
    to,
    columns,
    rows,
    isFree,
}: StepCheck): Point | null => {
    if (to.column < 0 || to.column >= columns) return null;
    if (to.row < 0 || to.row >= rows) return null;

    const target = getStandingPoint(to, isFree);
    if (!target) return null;

    const middle = { x: (from.x + target.x) / 2, y: (from.y + target.y) / 2 };
    return isFree(middle) ? target : null;
};

/**
 * The tiles to walk from the start to the goal, both included, in cardinal
 * steps, or null when there is no way. A turn costs more than a step, so the
 * way keeps to straight lines instead of a staircase.
 */
export const findPath = ({
    start,
    goal,
    columns,
    rows,
    isFree,
}: PathSearch): Cell[] | null => {
    if (goal.column < 0 || goal.column >= columns) return null;
    if (goal.row < 0 || goal.row >= rows) return null;
    if (!getStandingPoint(goal, isFree)) return null;

    const startCell = {
        column: Math.min(columns - 1, Math.max(0, start.column)),
        row: Math.min(rows - 1, Math.max(0, start.row)),
    };
    const toIndex = (cell: Cell) => cell.row * columns + cell.column;
    const estimate = (cell: Cell) =>
        Math.abs(cell.column - goal.column) + Math.abs(cell.row - goal.row);

    const total = columns * rows * STATES_PER_TILE;
    const cost = new Float32Array(total).fill(Infinity);
    const cameFrom = new Int32Array(total).fill(-1);
    const heap = new MinHeap();

    const startState = toIndex(startCell) * STATES_PER_TILE + NO_DIRECTION;
    cost[startState] = 0;
    heap.push(startState, estimate(startCell));

    for (
        let expanded = 0;
        heap.size > 0 && expanded < PATH_SEARCH.MAX_EXPANSIONS;
        expanded++
    ) {
        const state = heap.pop()!;
        const tile = Math.floor(state / STATES_PER_TILE);
        const direction = state % STATES_PER_TILE;
        const cell = { column: tile % columns, row: Math.floor(tile / columns) };

        if (cell.column === goal.column && cell.row === goal.row) {
            return rebuild(state, cameFrom, columns);
        }

        const from = getStandingPoint(cell, isFree) ?? getCellCenter(cell);
        DIRECTIONS.forEach((step, nextDirection) => {
            const next = {
                column: cell.column + step.x,
                row: cell.row + step.y,
            };
            if (!findStep({ from, to: next, columns, rows, isFree })) return;

            const isTurn =
                direction !== NO_DIRECTION && direction !== nextDirection;
            const nextCost =
                cost[state]! + 1 + (isTurn ? PATH_SEARCH.TURN_COST : 0);
            const nextState = toIndex(next) * STATES_PER_TILE + nextDirection;
            if (nextCost >= cost[nextState]!) return;

            cost[nextState] = nextCost;
            cameFrom[nextState] = state;
            heap.push(nextState, nextCost + estimate(next));
        });
    }

    return null;
};

const rebuild = (
    goalState: number,
    cameFrom: Int32Array,
    columns: number
): Cell[] => {
    const cells: Cell[] = [];
    let state = goalState;
    while (state !== -1) {
        const tile = Math.floor(state / STATES_PER_TILE);
        cells.push({ column: tile % columns, row: Math.floor(tile / columns) });
        state = cameFrom[state]!;
    }
    return cells.reverse();
};
