import type Phaser from "phaser";
import { PLAYER_PHYSICS, ZERO_VELOCITY } from "@/features/game/consts/player";
import {
    resolveMovementKeys,
    isAnyKeyDown,
    isGameInputSuspended,
    resolveAxis,
    resolveDirection,
    normalizeToSpeed,
    type MovementKeys,
} from "@/features/game/utils/player";
import { resolveSeatInput } from "@/features/game/utils/resolveSeatInput";
import type { Player } from "@/features/game/lib/Player";

export class PlayerController {
    private readonly player: Player;
    private readonly keys: MovementKeys;
    private movementReleased = false;

    constructor(scene: Phaser.Scene, player: Player) {
        this.player = player;
        this.keys = resolveMovementKeys(scene);
    }

    update(): void {
        // Backstop for `bindKeyboardFocusGuard`: if a focusin/focusout event
        // was ever missed, this still stops movement while typing.
        if (isGameInputSuspended()) {
            this.player.setMoveAxis(0, 0);
            this.player.setVelocity(ZERO_VELOCITY.x, ZERO_VELOCITY.y);
            return;
        }

        const axisX = resolveAxis(
            isAnyKeyDown(this.keys.LEFT),
            isAnyKeyDown(this.keys.RIGHT)
        );
        const axisY = resolveAxis(
            isAnyKeyDown(this.keys.UP),
            isAnyKeyDown(this.keys.DOWN)
        );
        const isMoving = axisX !== 0 || axisY !== 0;
        this.player.setMoveAxis(axisX, axisY);

        // Standing up is implicit: pressing a movement key while seated just
        // resumes walking, there's no separate "stand up" input.
        const seatInput = resolveSeatInput({
            isSitting: this.player.isSitting,
            isMoving,
            released: this.movementReleased,
        });
        this.movementReleased = seatInput.released;
        if (seatInput.standUp) this.player.standUp();
        const direction = resolveDirection(axisX, axisY);

        if (this.player.isSitting) {
            this.player.setVelocity(ZERO_VELOCITY.x, ZERO_VELOCITY.y);
            return;
        }

        if (direction) this.player.setDirection(direction);

        const velocity = normalizeToSpeed(axisX, axisY, PLAYER_PHYSICS.SPEED);
        this.player.setVelocity(velocity.x, velocity.y);
    }
}
