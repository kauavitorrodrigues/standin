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
    // The teleport count of the last snapshot, null before the first one.
    private lastTeleportCount: number | null = null;
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

    // A snapshot arrived: glide from where it is drawn to it. A teleport (the
    // count of the peer changed since the last snapshot) is shown at once, and
    // so is a jump farther than a walk can cover. The first snapshot only
    // records the count: someone who comes into sight with a count above 0
    // did not just teleport.
    push(x: number, y: number, now: number, teleportCount = 0): void {
        const hasTeleported =
            this.lastTeleportCount !== null &&
            this.lastTeleportCount !== teleportCount;
        this.lastTeleportCount = teleportCount;

        if (hasTeleported || this.isJump(x, y)) {
            this.snapTo(x, y);
            this.lastSnapshotAt = now;
            this.lastMovedAt = null;
            return;
        }

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

    private isJump(x: number, y: number): boolean {
        const fromDrawn = Math.hypot(x - this.x, y - this.y);
        if (fromDrawn > REMOTE_AVATAR_APPEARANCE.SNAP_DISTANCE_PX) return true;

        // The first snapshot has no earlier one to be far from.
        if (this.lastSnapshotAt === null) return false;
        const fromTarget = Math.hypot(x - this.targetX, y - this.targetY);
        return fromTarget > REMOTE_AVATAR_APPEARANCE.JUMP_FROM_TARGET_PX;
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
