import { describe, expect, it } from "vitest";
import { AVATAR, AVATAR_FRAMES, PLAYER_DIRECTIONS } from "@standin/contracts";
import {
    getDirectionFromKey,
    resolveFrameRect,
    rotateDirection,
} from "../frames";

describe("resolveFrameRect", () => {
    it("takes the idle frame of the direction", () => {
        const rect = resolveFrameRect("IDLE", PLAYER_DIRECTIONS.LEFT, 5000);
        expect(rect).toEqual({
            x: AVATAR_FRAMES.IDLE.left[0] * AVATAR.frame.w,
            y: 0,
            w: AVATAR.frame.w,
            h: AVATAR.frame.h,
        });
    });

    it("walks through the frames of the animation and wraps", () => {
        const walk = AVATAR_FRAMES.WALK.down;
        const at = (elapsedMs: number): number =>
            resolveFrameRect("WALK", PLAYER_DIRECTIONS.DOWN, elapsedMs).x;

        expect(at(0)).toBe(walk[0] * AVATAR.frame.w);
        expect(at(125)).toBe(walk[1] * AVATAR.frame.w);
        expect(at(250)).toBe(walk[2] * AVATAR.frame.w);
        expect(at(375)).toBe(walk[3] * AVATAR.frame.w);
        expect(at(500)).toBe(at(0));
    });
});

describe("rotateDirection", () => {
    it("goes through the four directions and comes back", () => {
        let direction: ReturnType<typeof rotateDirection> =
            PLAYER_DIRECTIONS.DOWN;
        const seen = [];
        for (let turn = 0; turn < 4; turn += 1) {
            direction = rotateDirection(direction);
            seen.push(direction);
        }
        expect(new Set(seen).size).toBe(4);
        expect(direction).toBe(PLAYER_DIRECTIONS.DOWN);
    });
});

describe("getDirectionFromKey", () => {
    it("maps the arrow keys", () => {
        expect(getDirectionFromKey("ArrowUp")).toBe(PLAYER_DIRECTIONS.UP);
        expect(getDirectionFromKey("ArrowLeft")).toBe(PLAYER_DIRECTIONS.LEFT);
    });

    it("ignores other keys", () => {
        expect(getDirectionFromKey("a")).toBeNull();
    });
});
