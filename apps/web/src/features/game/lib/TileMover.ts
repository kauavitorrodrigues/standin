import { getCellAt } from "@/features/game/utils/cell";
import { findStep, getStandingPoint } from "@/features/game/utils/findPath";
import type { Cell } from "@/features/game/types/cell";
import type { Player } from "@/features/game/lib/Player";

type Point = { x: number; y: number };

export type MovingPlayer = Pick<Player, "x" | "y" | "teleportTo">;

// One of the four directions, each axis -1, 0 or 1 and never both at once.
export type TileDirection = { x: number; y: number };

// Asked each time the avatar stands on the center of a tile, with that tile.
// It answers which way to go next, or null to stop there.
export type DirectionSource = (cell: Cell) => TileDirection | null;

export type TileMoveResult = {
    // Where the avatar is going now, `{ x: 0, y: 0 }` when it stands still.
    axis: TileDirection;
    // The avatar wanted to step and the next tile was closed to it.
    blocked: boolean;
};

const STILL: TileDirection = { x: 0, y: 0 };

type Step = {
    from: Point;
    to: Point;
    direction: TileDirection;
    length: number;
};

// Moves the avatar one tile at a time, from the center of a tile to the center
// of the next, at a steady speed and with no physics: a tile is open or it is
// not, like on a grid. Keys and the walk of a double click are the same thing
// here, they only differ in the source of the direction. The avatar keeps
// stepping for as long as the source gives a direction, with no pause between
// two tiles, so a held key walks smoothly.
export class TileMover {
    private step: Step | null = null;
    private travelled = 0;
    // Where the mover left the avatar, to tell when something else moved it.
    private lastPosition: Point | null = null;
    private readonly speed: number;
    private readonly size: { columns: number; rows: number };
    private readonly isFree: (point: Point) => boolean;

    constructor(
        speed: number,
        size: { columns: number; rows: number },
        isFree: (point: Point) => boolean
    ) {
        this.speed = speed;
        this.size = size;
        this.isFree = isFree;
    }

    isStepping(): boolean {
        return this.step !== null;
    }

    // Where the step that is running ends, null when the avatar stands still.
    // A new walk has to start from there: the avatar finishes this step, and
    // that is the tile it is on when the next direction is asked.
    getStepTarget(): Point | null {
        return this.step ? { x: this.step.to.x, y: this.step.to.y } : null;
    }

    cancel(): void {
        this.step = null;
        this.lastPosition = null;
    }

    update(
        player: MovingPlayer,
        deltaMs: number,
        getDirection: DirectionSource | null
    ): TileMoveResult {
        this.dropStepIfMoved(player);

        let budget = (this.speed * deltaMs) / 1000;
        let position: Point = { x: player.x, y: player.y };
        let axis = STILL;
        let blocked = false;

        while (budget > 0 || (!this.step && getDirection)) {
            if (!this.step) {
                if (!getDirection) break;

                const started = this.startStep(position, getDirection);
                if (started === "blocked") blocked = true;
                if (started !== "started") break;
            }

            const step = this.step!;
            axis = step.direction;
            const move = Math.min(budget, step.length - this.travelled);
            this.travelled += move;
            budget -= move;

            const done = this.travelled >= step.length;
            const share = this.travelled / step.length;
            position = done
                ? step.to
                : {
                    x: step.from.x + (step.to.x - step.from.x) * share,
                    y: step.from.y + (step.to.y - step.from.y) * share,
                };
            if (!done) break;

            this.step = null;
            // Arrived: whether it goes on is asked again, on the next tile.
            if (budget <= 0) break;
        }

        if (position.x !== player.x || position.y !== player.y) {
            player.teleportTo(position.x, position.y);
        }
        this.lastPosition = { x: position.x, y: position.y };
        return { axis, blocked };
    }

    private startStep(
        from: Point,
        getDirection: DirectionSource
    ): "started" | "stopped" | "blocked" {
        const cell = getCellAt(from);
        const direction = getDirection(cell);
        if (!direction) return "stopped";

        // The step is checked from where the avatar stands on its tile, the
        // same point the search planned it from, and not from where it happens
        // to be. Otherwise a step the search found open could be refused here.
        const standing = getStandingPoint(cell, this.isFree) ?? from;
        const target = findStep({
            from: standing,
            to: {
                column: cell.column + direction.x,
                row: cell.row + direction.y,
            },
            columns: this.size.columns,
            rows: this.size.rows,
            isFree: this.isFree,
        });
        if (!target) return "blocked";

        // The avatar ends on the standing point of the next tile. Off it in its
        // own tile, the first step bends a little to line up with it.
        this.step = {
            from: { x: from.x, y: from.y },
            to: target,
            direction,
            length: Math.hypot(target.x - from.x, target.y - from.y),
        };
        this.travelled = 0;
        return "started";
    }

    // Something else put the avatar somewhere (a seat, a free cell, the spawn),
    // so the step that was running no longer starts where it says.
    private dropStepIfMoved(player: MovingPlayer): void {
        const last = this.lastPosition;
        if (!last) return;
        if (Math.hypot(player.x - last.x, player.y - last.y) < 0.5) return;

        this.step = null;
    }
}
