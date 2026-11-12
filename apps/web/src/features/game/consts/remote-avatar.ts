import { SPACE_TICK_MS, TILE_SIZE } from "@standin/contracts";

export const REMOTE_AVATAR_APPEARANCE = {
    // A remote avatar closer than this to the position it is gliding to counts
    // as standing still, in px. Under it the smoothing is only settling.
    MOVING_THRESHOLD_PX: 1,
    // The server broadcasts positions on SPACE_TICK_MS (100 ms, 10 Hz). The avatar
    // glides linearly from where it is drawn to each new snapshot over the
    // time between snapshots, so it moves at a steady speed instead of
    // stepping.
    DEFAULT_SNAPSHOT_INTERVAL_MS: SPACE_TICK_MS,
    // After a snapshot that moved the peer, the avatar keeps walking this long
    // even if it already reached the target, so a late packet does not flip it
    // to idle for a frame or two. A snapshot at the same spot ends it at once.
    MOVING_GRACE_MS: 150,
    // The measured gap between snapshots is clamped to this range, so a
    // stalled connection does not make the avatar crawl and a burst of
    // packets does not make it jump.
    MIN_SNAPSHOT_INTERVAL_MS: 50,
    MAX_SNAPSHOT_INTERVAL_MS: 250,
    // A snapshot farther than this from the last one is a jump, not a step:
    // the avatar appears there at once instead of gliding through whatever is
    // in between. Walking at 220 px/s covers about 22 px per tick, so only a
    // gap above roughly 0.4 s between snapshots counts as a jump, which is
    // fine after a stall.
    JUMP_FROM_TARGET_PX: 3 * TILE_SIZE,
    // The same for the distance from where the avatar is drawn, which also
    // catches a hidden tab, where the glide does not advance.
    SNAP_DISTANCE_PX: 160,
} as const;
