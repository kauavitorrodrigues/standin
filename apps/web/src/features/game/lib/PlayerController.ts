import type Phaser from "phaser";
import { PLAYER_PHYSICS, ZERO_VELOCITY } from "@/features/game/consts/player";
import {
    resolveMovementKeys,
    isAnyKeyDown,
    isGameInputSuspended,
    resolveAxis,
    resolveCardinalAxis,
    type CardinalAxis,
    resolveDirection,
    normalizeToSpeed,
    type MovementKeys,
} from "@/features/game/utils/player";
import { resolveSeatInput } from "@/features/game/utils/resolveSeatInput";
import { MovementHoldGate } from "@/features/game/lib/MovementHoldGate";
import type { Player } from "@/features/game/lib/Player";

export class PlayerController {
    private readonly player: Player;
    private readonly keys: MovementKeys;
    private movementReleased = false;
    private lockedAxis: CardinalAxis | null = null;
    private readonly scene: Phaser.Scene;
    private readonly holdGate = new MovementHoldGate();

    constructor(scene: Phaser.Scene, player: Player) {
        this.scene = scene;
        this.player = player;
        this.keys = resolveMovementKeys(scene);
    }

    update(): void {
        // Backstop for `bindKeyboardFocusGuard`: if a focusin/focusout event
        // was ever missed, this still stops movement while typing.
        if (isGameInputSuspended()) {
            this.lockedAxis = null;
            this.holdGate.reset();
            this.player.setMoveAxis(0, 0);
            this.player.setVelocity(ZERO_VELOCITY.x, ZERO_VELOCITY.y);
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

        // A tap turns the avatar, and only a held key makes it walk.
        const walkX = isMoving ? axisX : 0;
        const walkY = isMoving ? axisY : 0;
        this.player.setMoveAxis(walkX, walkY);

        if (this.player.isSitting) {
            this.player.setVelocity(ZERO_VELOCITY.x, ZERO_VELOCITY.y);
            return;
        }

        if (direction) this.player.setDirection(direction);

        const velocity = normalizeToSpeed(walkX, walkY, PLAYER_PHYSICS.SPEED);
        this.player.setVelocity(velocity.x, velocity.y);
    }
}
