import type Phaser from "phaser";
import { PLAYER_PHYSICS, ZERO_VELOCITY } from "@/features/game/consts/player";
import {
    resolveMovementKeys,
    isAnyKeyDown,
    resolveAxis,
    resolveDirection,
    normalizeToSpeed,
    type MovementKeys,
} from "@/features/game/utils/player";
import type { Player } from "@/features/game/lib/Player";

export class PlayerController {
    private readonly player: Player;
    private readonly keys: MovementKeys;

    constructor(scene: Phaser.Scene, player: Player) {
        this.player = player;
        this.keys = resolveMovementKeys(scene);
    }

    update(): void {
        const axisX = resolveAxis(
            isAnyKeyDown(this.keys.LEFT),
            isAnyKeyDown(this.keys.RIGHT)
        );
        const axisY = resolveAxis(
            isAnyKeyDown(this.keys.UP),
            isAnyKeyDown(this.keys.DOWN)
        );
        const isMoving = axisX !== 0 || axisY !== 0;

        // Standing up is implicit: pressing a movement key while seated just
        // resumes walking, there's no separate "stand up" input.
        if (isMoving && this.player.isSitting) {
            this.player.setSitting(false);
        }

        if (this.player.isSitting) {
            this.player.setVelocity(ZERO_VELOCITY.x, ZERO_VELOCITY.y);
            return;
        }

        const direction = resolveDirection(axisX, axisY);
        if (direction) this.player.setDirection(direction);

        const velocity = normalizeToSpeed(axisX, axisY, PLAYER_PHYSICS.SPEED);
        this.player.setVelocity(velocity.x, velocity.y);
    }
}
