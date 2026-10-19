import type Phaser from "phaser";
import {
    AVATAR,
    PLAYER_DIRECTIONS,
    type PlayerDirection,
} from "@standin/contracts";
import {
    AVATAR_BODY_OFFSET,
    AVATAR_FIRST_FRAME,
    AVATAR_SPRITE_ORIGIN,
} from "@/features/game/consts/avatar-sprite";
import { AVATAR_GHOST_TEXTURE_KEY } from "@/features/avatar/consts/textures";
import type { SeatSpot } from "@/features/game/utils/buildSeatAreas";
import { getAvatarDepth } from "@/features/game/utils/getAvatarDepth";
import { playAvatarAnimation } from "@/features/game/utils/playAvatarAnimation";
import { AvatarBlink } from "@/features/game/lib/AvatarBlink";
import { resolveAvatarAnimation } from "@/features/game/utils/resolveAvatarAnimation";

// The local avatar. Its position is the anchor of the sprite, the point where
// the feet touch the ground, and its physics body is `AVATAR.body` around it.
export class Player {
    readonly gameObject: Phaser.Physics.Arcade.Sprite;
    direction: PlayerDirection = PLAYER_DIRECTIONS.DOWN;
    isSitting = false;
    // The depth of the piece it sits on, null when standing.
    private seatDepth: number | null = null;
    private readonly mapHeightPx: number;
    private textureKey: string;
    private readonly blink = new AvatarBlink();
    // What the movement keys ask for right now, each axis -1, 0 or 1.
    moveAxis = { x: 0, y: 0 };

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        mapHeightPx: number,
        textureKey: string = AVATAR_GHOST_TEXTURE_KEY
    ) {
        this.mapHeightPx = mapHeightPx;
        this.textureKey = textureKey;

        const sprite = scene.physics.add.sprite(
            x,
            y,
            textureKey,
            AVATAR_FIRST_FRAME
        );
        sprite.setOrigin(AVATAR_SPRITE_ORIGIN.x, AVATAR_SPRITE_ORIGIN.y);
        this.gameObject = sprite;

        this.body.setSize(AVATAR.body.w, AVATAR.body.h, false);
        this.body.setOffset(AVATAR_BODY_OFFSET.x, AVATAR_BODY_OFFSET.y);
        this.body.setCollideWorldBounds(true);
        this.update();
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

    // The anchor goes to the point of the seat, with the frame of sitting and
    // the way the seat faces.
    sitAt(seat: SeatSpot): void {
        this.teleportTo(seat.x, seat.y);
        this.setDirection(seat.direction);
        this.seatDepth = seat.depth;
        this.setSitting(true);
    }

    // The avatar gets up where it sits, and the movement keys carry it on.
    standUp(): void {
        this.seatDepth = null;
        this.setSitting(false);
    }

    setMoveAxis(x: number, y: number): void {
        this.moveAxis = { x, y };
    }

    setSitting(isSitting: boolean): void {
        this.isSitting = isSitting;
        this.update();
    }

    // Draws another sheet, the ghost or the one of the avatar of the user.
    setTexture(textureKey: string): void {
        if (textureKey === this.textureKey) return;

        this.textureKey = textureKey;
        this.gameObject.setTexture(textureKey, AVATAR_FIRST_FRAME);
        this.updateAnimation();
    }

    // What changes with the position and the state: depth and animation.
    // Called every frame.
    update(): void {
        this.updateDepth();
        this.updateAnimation();
    }

    // Walking, the avatar draws behind the objects whose base is below its
    // feet and over the ones above them.
    updateDepth(): void {
        this.gameObject.setDepth(
            getAvatarDepth({
                feetY: this.gameObject.y,
                mapHeightPx: this.mapHeightPx,
                isSitting: this.isSitting,
                seatDirection: this.direction,
                seatDepth: this.seatDepth,
            })
        );
    }

    private updateAnimation(): void {
        const isMoving = this.moveAxis.x !== 0 || this.moveAxis.y !== 0;
        const isBlinking = this.blink.update(
            this.gameObject.scene.time.now,
            !this.isSitting && !isMoving
        );
        playAvatarAnimation(
            this.gameObject,
            this.textureKey,
            resolveAvatarAnimation({
                isSitting: this.isSitting,
                isMoving,
                isBlinking,
            }),
            this.direction
        );
    }
}
