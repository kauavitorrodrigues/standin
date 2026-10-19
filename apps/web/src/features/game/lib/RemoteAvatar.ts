import Phaser from "phaser";
import { PLAYER_DIRECTIONS, type PlayerDirection } from "@standin/contracts";
import {
    AVATAR_FIRST_FRAME,
    AVATAR_SPRITE_ORIGIN,
} from "@/features/game/consts/avatar-sprite";
import { AVATAR_GHOST_TEXTURE_KEY } from "@/features/avatar/consts/textures";
import { AvatarBlink } from "@/features/game/lib/AvatarBlink";
import { getAvatarDepth } from "@/features/game/utils/getAvatarDepth";
import { playAvatarAnimation } from "@/features/game/utils/playAvatarAnimation";
import {
    isRemoteAvatarMoving,
    resolveSmoothingFactor,
} from "@/features/game/utils/remote-avatar";
import { resolveAvatarAnimation } from "@/features/game/utils/resolveAvatarAnimation";

// Visual counterpart to a peer's PlayerPosition, driven entirely by network
// updates: no physics body, no keyboard input. It is a sprite of the same
// sheet and the same grid as the local avatar, and its position is the anchor
// (the feet).
export class RemoteAvatar {
    readonly gameObject: Phaser.GameObjects.Sprite;
    private textureKey: string;
    private readonly blink = new AvatarBlink();
    private targetX: number;
    private targetY: number;
    // The avatar is constructed at the local spawn point (its peer's real
    // position isn't known yet), so the first move() must snap instead of
    // gliding there from an arbitrary, unrelated spot on the map.
    private hasReceivedPosition = false;
    private isSitting = false;
    // The depth of the piece the peer sits on, null when unknown or standing.
    private seatDepth: number | null = null;
    private direction: PlayerDirection = PLAYER_DIRECTIONS.DOWN;
    private readonly mapHeightPx: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        mapHeightPx: number,
        textureKey: string = AVATAR_GHOST_TEXTURE_KEY
    ) {
        this.mapHeightPx = mapHeightPx;
        this.textureKey = textureKey;
        this.gameObject = scene.add
            .sprite(x, y, textureKey, AVATAR_FIRST_FRAME)
            .setOrigin(AVATAR_SPRITE_ORIGIN.x, AVATAR_SPRITE_ORIGIN.y);
        this.targetX = x;
        this.targetY = y;
        this.refresh();
    }

    // Position updates arrive throttled (every SEND_INTERVAL_MS) and jump
    // straight to wherever the peer currently is, so applying them directly
    // would make the avatar visibly teleport in discrete steps instead of
    // walking. move() only records where it's headed; update() (called every
    // frame from MapScene) glides the actual game object towards that target.
    move(x: number, y: number): void {
        if (!this.hasReceivedPosition) {
            this.hasReceivedPosition = true;
            this.gameObject.setPosition(x, y);
        }

        this.targetX = x;
        this.targetY = y;
    }

    // delta is Phaser's per-frame delta in milliseconds.
    update(delta: number): void {
        const t = resolveSmoothingFactor(delta);

        this.gameObject.setPosition(
            Phaser.Math.Linear(this.gameObject.x, this.targetX, t),
            Phaser.Math.Linear(this.gameObject.y, this.targetY, t)
        );
        this.refresh();
    }

    // The way the peer faces, from its last PlayerPosition.
    updateAnimation(direction: PlayerDirection): void {
        this.direction = direction;
        this.refresh();
    }

    // The piece the peer sits on, found from the seat at its position.
    setSeatDepth(seatDepth: number | null): void {
        this.seatDepth = seatDepth;
        this.refresh();
    }

    setSitting(isSitting: boolean): void {
        this.isSitting = isSitting;
        this.refresh();
    }

    // Draws another sheet, the ghost or the one of the avatar of the peer.
    setTexture(textureKey: string): void {
        if (textureKey === this.textureKey) return;

        this.textureKey = textureKey;
        this.gameObject.setTexture(textureKey, AVATAR_FIRST_FRAME);
        this.refresh();
    }

    destroy(): void {
        this.gameObject.destroy();
    }

    // Same depth rule as the local avatar: behind the objects whose base is
    // below its feet, over the ones above them.
    private refresh(): void {
        this.gameObject.setDepth(
            getAvatarDepth({
                feetY: this.gameObject.y,
                mapHeightPx: this.mapHeightPx,
                isSitting: this.isSitting,
                seatDirection: this.direction,
                seatDepth: this.seatDepth,
            })
        );

        const isMoving = isRemoteAvatarMoving(this.gameObject, {
            x: this.targetX,
            y: this.targetY,
        });
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
