import { REMOTE_AVATAR_APPEARANCE } from "@/features/game/consts/remote-avatar";

const MS_PER_SECOND = 1000;

// Exponential smoothing factor for one frame of `delta` milliseconds -
// see REMOTE_AVATAR_APPEARANCE.POSITION_LERP_RATE for why the rate is
// tied to SEND_INTERVAL_MS. Frame-rate independent: composing this over
// two frames of d1 and d2 yields the same result as one frame of d1+d2.
export const resolveSmoothingFactor = (delta: number): number =>
    1 -
    Math.exp(
        (-REMOTE_AVATAR_APPEARANCE.POSITION_LERP_RATE * delta) / MS_PER_SECOND
    );

// Whether a remote avatar is walking: it is still some distance from the
// position its peer last sent. Standing still, the smoothing settles under
// the threshold within a few frames.
export const isRemoteAvatarMoving = (
    from: { x: number; y: number },
    to: { x: number; y: number }
): boolean =>
    Math.hypot(to.x - from.x, to.y - from.y) >
    REMOTE_AVATAR_APPEARANCE.MOVING_THRESHOLD_PX;
