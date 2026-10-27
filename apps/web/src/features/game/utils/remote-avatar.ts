import { REMOTE_AVATAR_APPEARANCE } from "@/features/game/consts/remote-avatar";

// How long the avatar takes to glide to the snapshot that just arrived: the
// time since the previous one, kept inside a sane range.
export const resolveSnapshotInterval = (elapsedMs: number): number =>
    Math.min(
        REMOTE_AVATAR_APPEARANCE.MAX_SNAPSHOT_INTERVAL_MS,
        Math.max(REMOTE_AVATAR_APPEARANCE.MIN_SNAPSHOT_INTERVAL_MS, elapsedMs)
    );

// Progress (0 to 1) of the glide after `deltaMs` more milliseconds. Linear, so
// the speed is constant between two snapshots and frame-rate independent.
export const advanceInterpolation = (
    progress: number,
    deltaMs: number,
    durationMs: number
): number => Math.min(1, progress + deltaMs / durationMs);

// Whether a remote avatar is walking: it is still some distance from the
// position its peer last sent. Standing still, the smoothing settles under
// the threshold within a few frames.
export const isRemoteAvatarMoving = (
    from: { x: number; y: number },
    to: { x: number; y: number }
): boolean =>
    Math.hypot(to.x - from.x, to.y - from.y) >
    REMOTE_AVATAR_APPEARANCE.MOVING_THRESHOLD_PX;
