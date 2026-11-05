import { describe, expect, it, vi } from "vitest";
import { CONFETTI_THROTTLE_MS } from "@/features/game/consts/confetti";
import { ConfettiThrottle } from "../ConfettiThrottle";

describe("ConfettiThrottle", () => {
    it("throws the first press at once", () => {
        const dispatch = vi.fn();

        new ConfettiThrottle(dispatch, () => 1000).fire();

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("drops the presses inside the window", () => {
        const dispatch = vi.fn();
        let now = 1000;
        const throttle = new ConfettiThrottle(dispatch, () => now);

        throttle.fire();
        now += CONFETTI_THROTTLE_MS - 1;
        throttle.fire();

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("throws again once the window has passed", () => {
        const dispatch = vi.fn();
        let now = 1000;
        const throttle = new ConfettiThrottle(dispatch, () => now);

        throttle.fire();
        now += CONFETTI_THROTTLE_MS;
        throttle.fire();

        expect(dispatch).toHaveBeenCalledTimes(2);
    });
});
