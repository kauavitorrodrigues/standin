import type Phaser from "phaser";
import { ZERO_VELOCITY } from "@/features/game/consts/player";
import {
    resolveMovementKeys,
    isAnyKeyDown,
    isGameInputSuspended,
    resolveAxis,
    resolveCardinalAxis,
    type CardinalAxis,
    resolveDirection,
    type MovementKeys,
} from "@/features/game/utils/player";
import { resolveSeatInput } from "@/features/game/utils/resolveSeatInput";
import { MovementHoldGate } from "@/features/game/lib/MovementHoldGate";
import type { Cell } from "@/features/game/types/cell";
import type { PathWalker } from "@/features/game/lib/PathWalker";
import type { DirectionSource, TileMover } from "@/features/game/lib/TileMover";
import type { Player } from "@/features/game/lib/Player";

// Turns the keys and the walk of a double click into steps of the mover, one
// tile at a time. The avatar never moves through the physics.
export class PlayerController {
    private readonly player: Player;
    private readonly keys: MovementKeys;
    private movementReleased = false;
    private lockedAxis: CardinalAxis | null = null;
    private readonly scene: Phaser.Scene;
    private readonly holdGate = new MovementHoldGate();
    private readonly walker: PathWalker;
    private readonly mover: TileMover;
    // Told where a walk was going when a tile on its way closed.
    private readonly onWalkBlocked: (destination: Cell) => void;

    constructor(
        scene: Phaser.Scene,
        player: Player,
        walker: PathWalker,
        mover: TileMover,
        onWalkBlocked: (destination: Cell) => void
    ) {
        this.scene = scene;
        this.player = player;
        this.walker = walker;
        this.mover = mover;
        this.onWalkBlocked = onWalkBlocked;
        this.keys = resolveMovementKeys(scene);
    }

    update(deltaMs: number): void {
        // Backstop for `bindKeyboardFocusGuard`: if a focusin/focusout event
        // was ever missed, this still stops movement while typing.
        if (isGameInputSuspended()) {
            this.walker.cancel();
            this.stand();
            this.lockedAxis = null;
            this.holdGate.reset();
            return;
        }

        const heldX = resolveAxis(
            isAnyKeyDown(this.keys.LEFT),
            isAnyKeyDown(this.keys.RIGHT)
        );
        const heldY = resolveAxis(
            isAnyKeyDown(this.keys.UP),
            isAnyKeyDown(this.keys.DOWN)
        );
        const {
            x: axisX,
            y: axisY,
            lockedAxis,
        } = resolveCardinalAxis(heldX, heldY, this.lockedAxis);
        this.lockedAxis = lockedAxis;
        const isPressing = axisX !== 0 || axisY !== 0;

        // A key takes the avatar back from a walk started by a double click.
        if (isPressing) this.walker.cancel();
        const isMoving = this.holdGate.update(
            this.scene.time.now,
            isPressing ? `${axisX},${axisY}` : null
        );

        // Standing up is implicit: pressing a movement key while seated just
        // resumes walking, there's no separate "stand up" input.
        const seatInput = resolveSeatInput({
            isSitting: this.player.isSitting,
            isMoving: isPressing,
            released: this.movementReleased,
        });
        this.movementReleased = seatInput.released;
        if (seatInput.standUp) this.player.standUp();
        const direction = resolveDirection(axisX, axisY);

        if (this.player.isSitting) {
            this.stand();
            return;
        }

        if (direction) this.player.setDirection(direction);

        // A tap turns the avatar, and only a held key makes it walk.
        const walkX = isMoving ? axisX : 0;
        const walkY = isMoving ? axisY : 0;
        const isKeyWalk = walkX !== 0 || walkY !== 0;
        this.move(deltaMs, isKeyWalk ? () => ({ x: walkX, y: walkY }) : null);
    }

    // One frame of the mover: the keys when one is held to walk, otherwise the
    // walk of a double click, otherwise nothing.
    private move(deltaMs: number, keyDirection: DirectionSource | null): void {
        const isWalk = keyDirection === null && this.walker.isWalking();
        const source = keyDirection ?? (isWalk ? this.walker.next : null);
        const { axis, blocked } = this.mover.update(
            this.player,
            deltaMs,
            source
        );

        this.player.setMoveAxis(axis.x, axis.y);
        const facing = resolveDirection(axis.x, axis.y);
        if (facing) this.player.setDirection(facing);
        this.player.setVelocity(ZERO_VELOCITY.x, ZERO_VELOCITY.y);

        if (blocked && isWalk) this.handBackWalk();
    }

    private handBackWalk(): void {
        const destination = this.walker.getDestination();
        this.walker.cancel();
        if (destination) this.onWalkBlocked(destination);
    }

    private stand(): void {
        this.mover.cancel();
        this.player.setMoveAxis(0, 0);
        this.player.setVelocity(ZERO_VELOCITY.x, ZERO_VELOCITY.y);
    }
}
