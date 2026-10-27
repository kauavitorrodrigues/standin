import { REMOTE_AVATAR_APPEARANCE } from "@/features/game/consts/remote-avatar";
import {
    advanceInterpolation,
    isRemoteAvatarMoving,
    resolveSnapshotInterval,
} from "@/features/game/utils/remote-avatar";

// The position math of a remote avatar, without Phaser: the linear glide
// between snapshots and the walking state. `now` is the scene clock in ms.
export class RemoteAvatarGlide {
    x: number;
    y: number;
    private startX: number;
    private startY: number;
    private targetX: number;
    private targetY: number;
    private progress = 1;
    private durationMs: number =
        REMOTE_AVATAR_APPEARANCE.DEFAULT_SNAPSHOT_INTERVAL_MS;
    private lastSnapshotAt: number | null = null;
    // When the last snapshot that moved the peer arrived, null once it stopped.
    private lastMovedAt: number | null = null;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.targetX = x;
        this.targetY = y;
    }

    // Snaps to the position without gliding.
    snapTo(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.targetX = x;
        this.targetY = y;
        this.progress = 1;
    }

    // A snapshot arrived: glide from where it is drawn to it.
    push(x: number, y: number, now: number): void {
        if (this.lastSnapshotAt !== null) {
            this.durationMs = resolveSnapshotInterval(
                now - this.lastSnapshotAt
            );
        }
        this.lastSnapshotAt = now;

        const peerMoved = isRemoteAvatarMoving(
            { x: this.targetX, y: this.targetY },
            { x, y }
        );
        this.lastMovedAt = peerMoved ? now : null;

        this.startX = this.x;
        this.startY = this.y;
        this.progress = 0;
        this.targetX = x;
        this.targetY = y;
    }

    // delta is the frame time in milliseconds.
    advance(delta: number): void {
        this.progress = advanceInterpolation(
            this.progress,
            delta,
            this.durationMs
        );
        this.x = this.startX + (this.targetX - this.startX) * this.progress;
        this.y = this.startY + (this.targetY - this.startY) * this.progress;
    }

    isMoving(now: number): boolean {
        const isGliding = isRemoteAvatarMoving(
            { x: this.x, y: this.y },
            { x: this.targetX, y: this.targetY }
        );
        if (isGliding) return true;

        return (
            this.lastMovedAt !== null &&
            now - this.lastMovedAt < REMOTE_AVATAR_APPEARANCE.MOVING_GRACE_MS
        );
    }
}
