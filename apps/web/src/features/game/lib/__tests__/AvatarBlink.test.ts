import { describe, expect, it } from "vitest";
import { AVATAR_BLINK } from "@/features/game/consts/avatar-blink";
import { AvatarBlink } from "../AvatarBlink";

// Always the shortest wait, so the times are easy to reason about.
const SHORTEST = () => 0;
const { DURATION_MS, MIN_INTERVAL_MS } = AVATAR_BLINK;

describe("AvatarBlink", () => {
    it("keeps the eyes open until the first wait is over", () => {
        const blink = new AvatarBlink(SHORTEST);

        expect(blink.update(0, true)).toBe(false);
        expect(blink.update(MIN_INTERVAL_MS - 1, true)).toBe(false);
    });

    it("closes the eyes for the duration, then opens them", () => {
        const blink = new AvatarBlink(SHORTEST);
        blink.update(0, true);

        expect(blink.update(MIN_INTERVAL_MS, true)).toBe(true);
        expect(blink.update(MIN_INTERVAL_MS + DURATION_MS - 1, true)).toBe(
            true
        );
        expect(blink.update(MIN_INTERVAL_MS + DURATION_MS, true)).toBe(false);
    });

    it("waits again after a blink", () => {
        const blink = new AvatarBlink(SHORTEST);
        blink.update(0, true);
        blink.update(MIN_INTERVAL_MS, true);
        const reopened = MIN_INTERVAL_MS + DURATION_MS;

        expect(blink.update(reopened + MIN_INTERVAL_MS - 1, true)).toBe(false);
        expect(blink.update(reopened + MIN_INTERVAL_MS, true)).toBe(true);
    });

    it("never blinks while it can not, and waits again when it can", () => {
        const blink = new AvatarBlink(SHORTEST);
        blink.update(0, true);

        expect(blink.update(MIN_INTERVAL_MS, false)).toBe(false);
        expect(blink.update(MIN_INTERVAL_MS + 1, true)).toBe(false);
        expect(blink.update(MIN_INTERVAL_MS * 2, true)).toBe(false);
        expect(blink.update(MIN_INTERVAL_MS * 2 + 2, true)).toBe(true);
    });

    it("opens the eyes when it stops being able to blink", () => {
        const blink = new AvatarBlink(SHORTEST);
        blink.update(0, true);
        blink.update(MIN_INTERVAL_MS, true);

        expect(blink.update(MIN_INTERVAL_MS + 1, false)).toBe(false);
    });
});
