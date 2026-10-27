import { describe, expect, it } from "vitest";
import { REMOTE_AVATAR_APPEARANCE } from "@/features/game/consts/remote-avatar";
import {
    advanceInterpolation,
    isRemoteAvatarMoving,
    resolveSnapshotInterval,
} from "../remote-avatar";

describe("isRemoteAvatarMoving", () => {
    it("is moving while it is farther than the threshold from the target", () => {
        const far = REMOTE_AVATAR_APPEARANCE.MOVING_THRESHOLD_PX + 1;

        expect(isRemoteAvatarMoving({ x: 0, y: 0 }, { x: far, y: 0 })).toBe(
            true
        );
        expect(isRemoteAvatarMoving({ x: 0, y: 0 }, { x: 0, y: -far })).toBe(
            true
        );
    });

    it("is standing once it settled on the target", () => {
        expect(isRemoteAvatarMoving({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(
            false
        );
        expect(
            isRemoteAvatarMoving(
                { x: 5, y: 5 },
                { x: 5 + REMOTE_AVATAR_APPEARANCE.MOVING_THRESHOLD_PX, y: 5 }
            )
        ).toBe(false);
    });
});

describe("advanceInterpolation", () => {
    it("composes over frames the same as over one frame", () => {
        const once = advanceInterpolation(0, 32, 100);
        const twice = advanceInterpolation(
            advanceInterpolation(0, 16, 100),
            16,
            100
        );

        expect(twice).toBeCloseTo(once, 10);
    });

    it("reaches the snapshot in one interval and stops there", () => {
        expect(advanceInterpolation(0, 100, 100)).toBe(1);
        expect(advanceInterpolation(0.9, 100, 100)).toBe(1);
    });
});

describe("resolveSnapshotInterval", () => {
    it("keeps the measured gap inside the range", () => {
        expect(resolveSnapshotInterval(100)).toBe(100);
        expect(resolveSnapshotInterval(1)).toBe(
            REMOTE_AVATAR_APPEARANCE.MIN_SNAPSHOT_INTERVAL_MS
        );
        expect(resolveSnapshotInterval(5000)).toBe(
            REMOTE_AVATAR_APPEARANCE.MAX_SNAPSHOT_INTERVAL_MS
        );
    });
});
