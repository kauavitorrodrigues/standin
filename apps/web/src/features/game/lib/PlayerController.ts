import type Phaser from "phaser";
import { PLAYER_PHYSICS } from "@/features/game/consts/player";
import {
    resolveMovementKeys,
    isAnyKeyDown,
    resolveAxis,
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
        const velocity = normalizeToSpeed(axisX, axisY, PLAYER_PHYSICS.SPEED);

        this.player.setVelocity(velocity.x, velocity.y);
    }
}
