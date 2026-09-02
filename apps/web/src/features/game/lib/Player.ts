import type Phaser from "phaser";
import { PLAYER_DIRECTIONS, type PlayerDirection } from "@standin/contracts";
import { PLAYER_APPEARANCE } from "@/features/game/consts/player";

export class Player {
    readonly gameObject: Phaser.GameObjects.Arc;
    direction: PlayerDirection = PLAYER_DIRECTIONS.DOWN;
    isSitting = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        const circle = scene.add.circle(
            x,
            y,
            PLAYER_APPEARANCE.RADIUS,
            PLAYER_APPEARANCE.COLOR
        );
        circle.setDepth(PLAYER_APPEARANCE.DEPTH);

        scene.physics.add.existing(circle);

        this.gameObject = circle;
        this.body.setCircle(PLAYER_APPEARANCE.RADIUS);
        this.body.setCollideWorldBounds(true);
    }

    get body(): Phaser.Physics.Arcade.Body {
        return this.gameObject.body as Phaser.Physics.Arcade.Body;
    }

    get x(): number {
        return this.gameObject.x;
    }

    get y(): number {
        return this.gameObject.y;
    }

    setVelocity(x: number, y: number): void {
        this.body.setVelocity(x, y);
    }

    teleportTo(x: number, y: number): void {
        this.body.reset(x, y);
    }

    setDirection(direction: PlayerDirection): void {
        this.direction = direction;
    }

    setSitting(isSitting: boolean): void {
        this.isSitting = isSitting;
    }
}
