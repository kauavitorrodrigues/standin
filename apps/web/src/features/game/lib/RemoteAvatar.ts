import Phaser from "phaser";
import { PLAYER_DIRECTIONS, type PlayerDirection } from "@standin/contracts";
import { REMOTE_AVATAR_APPEARANCE } from "@/features/game/consts/remote-avatar";

// Offset of the small direction indicator relative to the avatar's center,
// one radius out towards the faced direction - avoids rotating a shape (no
// sprite/animation system exists yet to animate a facing direction with).
const DIRECTION_OFFSETS: Record<PlayerDirection, { x: number; y: number }> = {
    [PLAYER_DIRECTIONS.UP]: { x: 0, y: -REMOTE_AVATAR_APPEARANCE.RADIUS },
    [PLAYER_DIRECTIONS.DOWN]: { x: 0, y: REMOTE_AVATAR_APPEARANCE.RADIUS },
    [PLAYER_DIRECTIONS.LEFT]: { x: -REMOTE_AVATAR_APPEARANCE.RADIUS, y: 0 },
    [PLAYER_DIRECTIONS.RIGHT]: { x: REMOTE_AVATAR_APPEARANCE.RADIUS, y: 0 },
};

// Visual counterpart to a peer's PlayerPosition, driven entirely by network
// updates - no physics body, no keyboard input. Mirrors Player's minimal
// circle rendering (no layered body/hair/clothing sprites exist in the
// project yet; avatarConfig is always null until that feature exists).
export class RemoteAvatar {
    readonly gameObject: Phaser.GameObjects.Container;
    private readonly directionIndicator: Phaser.GameObjects.Arc;
    private targetX: number;
    private targetY: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        const body = scene.add.circle(
            0,
            0,
            REMOTE_AVATAR_APPEARANCE.RADIUS,
            REMOTE_AVATAR_APPEARANCE.COLOR
        );

        this.directionIndicator = scene.add.circle(
            DIRECTION_OFFSETS[PLAYER_DIRECTIONS.DOWN].x,
            DIRECTION_OFFSETS[PLAYER_DIRECTIONS.DOWN].y,
            REMOTE_AVATAR_APPEARANCE.DIRECTION_INDICATOR_RADIUS,
            REMOTE_AVATAR_APPEARANCE.DIRECTION_INDICATOR_COLOR
        );

        this.gameObject = scene.add.container(x, y, [body, this.directionIndicator]);
        this.gameObject.setDepth(REMOTE_AVATAR_APPEARANCE.DEPTH);
        this.targetX = x;
        this.targetY = y;
    }

    // Position updates arrive throttled (every SEND_INTERVAL_MS) and jump
    // straight to wherever the peer currently is, so applying them directly
    // would make the avatar visibly teleport in discrete steps instead of
    // walking. move() only records where it's headed; update() (called every
    // frame from MapScene) glides the actual game object towards that target.
    move(x: number, y: number): void {
        this.targetX = x;
        this.targetY = y;
    }

    update(): void {
        this.gameObject.setPosition(
            Phaser.Math.Linear(
                this.gameObject.x,
                this.targetX,
                REMOTE_AVATAR_APPEARANCE.POSITION_LERP
            ),
            Phaser.Math.Linear(
                this.gameObject.y,
                this.targetY,
                REMOTE_AVATAR_APPEARANCE.POSITION_LERP
            )
        );
    }

    updateAnimation(direction: PlayerDirection): void {
        const offset = DIRECTION_OFFSETS[direction];
        this.directionIndicator.setPosition(offset.x, offset.y);
    }

    setSitting(isSitting: boolean): void {
        this.gameObject.setAlpha(
            isSitting
                ? REMOTE_AVATAR_APPEARANCE.SITTING_ALPHA
                : REMOTE_AVATAR_APPEARANCE.DEFAULT_ALPHA
        );
    }

    destroy(): void {
        this.gameObject.destroy();
    }
}
