import { PLAYER_DIRECTIONS, type PlayerDirection } from "@standin/contracts";
import {
    CLICK_WALK_CHANCE,
    IDLE_MAX_MS,
    IDLE_MIN_MS,
    KEY_HOLD_MAX_MS,
    KEY_HOLD_MIN_MS,
    WALK_SPEED_PX_PER_SEC,
} from "../consts";
import type { Arena } from "./buildArena";

export type Rng = () => number;

type Point = { x: number; y: number };

export type Walker = Point & {
    direction: PlayerDirection;
    // Key being held. Null while idle or following a click path.
    heading: PlayerDirection | null;
    // Ms left on the held key or on the idle wait.
    remainingMs: number;
    // Corners of a click path still to reach. Empty for keys and idle.
    path: Point[];
};

const DIRECTIONS = Object.values(PLAYER_DIRECTIONS);

const VECTORS: Record<PlayerDirection, Point> = {
    [PLAYER_DIRECTIONS.UP]: { x: 0, y: -1 },
    [PLAYER_DIRECTIONS.DOWN]: { x: 0, y: 1 },
    [PLAYER_DIRECTIONS.LEFT]: { x: -1, y: 0 },
    [PLAYER_DIRECTIONS.RIGHT]: { x: 1, y: 0 },
};

const between = (rng: Rng, min: number, max: number) =>
    min + rng() * (max - min);

export const createWalker = (rng: Rng, arena: Arena): Walker => ({
    ...arena.randomFreePoint(rng),
    direction: PLAYER_DIRECTIONS.DOWN,
    heading: null,
    remainingMs: between(rng, 0, IDLE_MAX_MS),
    path: [],
});

const isIdle = (walker: Walker) =>
    walker.heading === null && walker.path.length === 0;

const isFollowingPath = (walker: Walker) => walker.path.length > 0;

// The click walk goes along one axis and then the other, never diagonal, like
// the 4-connected A* of the game client.
const buildClickPath = (walker: Walker, rng: Rng, arena: Arena): Point[] => {
    const target = arena.randomFreePoint(rng);
    return [
        { x: target.x, y: walker.y },
        { x: target.x, y: target.y },
    ];
};

const startNextWalk = (walker: Walker, rng: Rng, arena: Arena): Walker => {
    if (rng() < CLICK_WALK_CHANCE) {
        return {
            ...walker,
            heading: null,
            path: buildClickPath(walker, rng, arena),
        };
    }
    const heading = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];
    return {
        ...walker,
        heading,
        direction: heading,
        remainingMs: between(rng, KEY_HOLD_MIN_MS, KEY_HOLD_MAX_MS),
        path: [],
    };
};

const startIdle = (walker: Walker, rng: Rng): Walker => ({
    ...walker,
    heading: null,
    path: [],
    remainingMs: between(rng, IDLE_MIN_MS, IDLE_MAX_MS),
});

const resolveLegHeading = (walker: Walker, corner: Point): PlayerDirection => {
    if (corner.x !== walker.x) {
        return corner.x > walker.x
            ? PLAYER_DIRECTIONS.RIGHT
            : PLAYER_DIRECTIONS.LEFT;
    }
    return corner.y > walker.y ? PLAYER_DIRECTIONS.DOWN : PLAYER_DIRECTIONS.UP;
};

// A step into a wall or out of the map ends the walk, the way a held key against
// a wall stops the avatar of a person.
const followPath = (
    walker: Walker,
    stepPx: number,
    rng: Rng,
    arena: Arena
): Walker => {
    const [corner, ...rest] = walker.path;
    if (!corner) return startIdle(walker, rng);

    const legPx = Math.abs(corner.x - walker.x) + Math.abs(corner.y - walker.y);
    if (legPx === 0) {
        return followPath({ ...walker, path: rest }, stepPx, rng, arena);
    }

    const heading = resolveLegHeading(walker, corner);
    const travelled = Math.min(stepPx, legPx);
    const vector = VECTORS[heading];
    const x = Math.round(walker.x + vector.x * travelled);
    const y = Math.round(walker.y + vector.y * travelled);
    if (!arena.isFree(x, y)) return startIdle(walker, rng);

    return { ...walker, direction: heading, x, y };
};

const holdKey = (
    walker: Walker,
    dtMs: number,
    stepPx: number,
    rng: Rng,
    arena: Arena
): Walker => {
    if (walker.remainingMs <= 0 || !walker.heading) {
        return startIdle(walker, rng);
    }
    const vector = VECTORS[walker.heading];
    const x = Math.round(walker.x + vector.x * stepPx);
    const y = Math.round(walker.y + vector.y * stepPx);
    if (!arena.isFree(x, y)) return startIdle(walker, rng);

    return { ...walker, x, y, remainingMs: walker.remainingMs - dtMs };
};

const waitIdle = (
    walker: Walker,
    dtMs: number,
    rng: Rng,
    arena: Arena
): Walker => {
    const left = walker.remainingMs - dtMs;
    if (left > 0) return { ...walker, remainingMs: left };
    return startNextWalk(walker, rng, arena);
};

const advance = (
    walker: Walker,
    dtMs: number,
    stepPx: number,
    rng: Rng,
    arena: Arena
): Walker => {
    if (isIdle(walker)) return waitIdle(walker, dtMs, rng, arena);
    if (isFollowingPath(walker)) return followPath(walker, stepPx, rng, arena);
    return holdKey(walker, dtMs, stepPx, rng, arena);
};

// One tick of a walking bot. `moved` is false while it stands still, and the
// client only sends a position when it changed, so the bot does the same.
export const stepWalker = (
    walker: Walker,
    dtMs: number,
    rng: Rng,
    arena: Arena
): { walker: Walker; moved: boolean } => {
    const stepPx = (WALK_SPEED_PX_PER_SEC * dtMs) / 1000;
    const next = advance(walker, dtMs, stepPx, rng, arena);
    return { walker: next, moved: next.x !== walker.x || next.y !== walker.y };
};
