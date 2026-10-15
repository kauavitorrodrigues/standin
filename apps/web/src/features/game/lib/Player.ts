import type Phaser from "phaser";
import { PLAYER_DIRECTIONS, type PlayerDirection } from "@standin/contracts";
import { PLAYER_APPEARANCE } from "@/features/game/consts/player";
import type { SeatSpot } from "@/features/game/utils/buildSeatAreas";
import { getAvatarDepth } from "@/features/game/utils/getAvatarDepth";

export class Player {
    readonly gameObject: Phaser.GameObjects.Arc;
    direction: PlayerDirection = PLAYER_DIRECTIONS.DOWN;
    isSitting = false;
    private readonly mapHeightPx: number;
    // What the movement keys ask for right now, each axis -1, 0 or 1.
    moveAxis = { x: 0, y: 0 };

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        mapHeightPx: number
    ) {
        this.mapHeightPx = mapHeightPx;
        const circle = scene.add.circle(
            x,
            y,
            PLAYER_APPEARANCE.RADIUS,
            PLAYER_APPEARANCE.COLOR
        );
        scene.physics.add.existing(circle);

        this.gameObject = circle;
        this.updateDepth();
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

    sitAt(seat: SeatSpot): void {
        this.teleportTo(seat.x, seat.y);
        this.setDirection(seat.direction);
        this.setSitting(true);
    }

    // The avatar gets up where it sits, and the movement keys carry it on.
    standUp(): void {
        this.setSitting(false);
    }

    setMoveAxis(x: number, y: number): void {
        this.moveAxis = { x, y };
    }

    setSitting(isSitting: boolean): void {
        this.isSitting = isSitting;
        this.updateDepth();
    }

    // Walking, the avatar draws behind the objects whose base is below its
    // feet and over the ones above them. Called every frame.
    updateDepth(): void {
        this.gameObject.setDepth(
            getAvatarDepth({
                centerY: this.gameObject.y,
                radius: PLAYER_APPEARANCE.RADIUS,
                mapHeightPx: this.mapHeightPx,
                isSitting: this.isSitting,
            })
        );
    }

    setSpeaking(isSpeaking: boolean): void {
        if (isSpeaking) {
            this.gameObject.setStrokeStyle(
                PLAYER_APPEARANCE.SPEAKING_RING_WIDTH,
                PLAYER_APPEARANCE.SPEAKING_RING_COLOR
            );
        } else {
            this.gameObject.setStrokeStyle();
        }
    }
}
