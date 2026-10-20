import { describe, expect, it } from "vitest";
import { resolveAvatarAnimation } from "../resolveAvatarAnimation";

describe("resolveAvatarAnimation", () => {
    it("plays idle when standing still", () => {
        expect(
            resolveAvatarAnimation({
                isSitting: false,
                isMoving: false,
                isBlinking: false,
            })
        ).toBe("IDLE");
    });

    it("plays walk when moving", () => {
        expect(
            resolveAvatarAnimation({
                isSitting: false,
                isMoving: true,
                isBlinking: false,
            })
        ).toBe("WALK");
    });

    it("plays sit whenever seated, moving or not", () => {
        expect(
            resolveAvatarAnimation({
                isSitting: true,
                isMoving: false,
                isBlinking: false,
            })
        ).toBe("SIT");
        expect(
            resolveAvatarAnimation({
                isSitting: true,
                isMoving: true,
                isBlinking: false,
            })
        ).toBe("SIT");
    });

    it("plays blink when standing still with the eyes closed", () => {
        expect(
            resolveAvatarAnimation({
                isSitting: false,
                isMoving: false,
                isBlinking: true,
            })
        ).toBe("BLINK");
    });

    it("keeps walk and sit over a blink", () => {
        expect(
            resolveAvatarAnimation({
                isSitting: false,
                isMoving: true,
                isBlinking: true,
            })
        ).toBe("WALK");
        expect(
            resolveAvatarAnimation({
                isSitting: true,
                isMoving: false,
                isBlinking: true,
            })
        ).toBe("SIT");
    });
});
