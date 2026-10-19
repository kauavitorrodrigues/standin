import { describe, expect, it } from "vitest";
import { REMOTE_AVATAR_APPEARANCE } from "@/features/game/consts/remote-avatar";
import { isRemoteAvatarMoving, resolveSmoothingFactor } from "../remote-avatar";

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

describe("resolveSmoothingFactor", () => {
    it("composes over frames the same as over one frame", () => {
        const once = resolveSmoothingFactor(32);
        const twice = 1 - (1 - resolveSmoothingFactor(16)) ** 2;

        expect(twice).toBeCloseTo(once, 10);
    });
});
