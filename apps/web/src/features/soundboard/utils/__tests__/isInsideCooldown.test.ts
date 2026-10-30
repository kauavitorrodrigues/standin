import { describe, expect, it } from "vitest";
import { SOUNDBOARD_COOLDOWN_MS } from "@standin/contracts";
import { isInsideCooldown } from "../isInsideCooldown";

describe("isInsideCooldown", () => {
    it("lets the first play through", () => {
        expect(isInsideCooldown(null, 1000, SOUNDBOARD_COOLDOWN_MS)).toBe(
            false
        );
    });

    it("drops a click right after the last play", () => {
        expect(isInsideCooldown(1000, 1000, SOUNDBOARD_COOLDOWN_MS)).toBe(true);
        expect(
            isInsideCooldown(
                1000,
                1000 + SOUNDBOARD_COOLDOWN_MS - 1,
                SOUNDBOARD_COOLDOWN_MS
            )
        ).toBe(true);
    });

    it("lets a click through once the wait is over", () => {
        expect(
            isInsideCooldown(
                1000,
                1000 + SOUNDBOARD_COOLDOWN_MS,
                SOUNDBOARD_COOLDOWN_MS
            )
        ).toBe(false);
    });
});
