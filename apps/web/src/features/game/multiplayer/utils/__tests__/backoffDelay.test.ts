import { afterEach, describe, expect, it, vi } from "vitest";
import { backoffDelay } from "../backoffDelay";
import { JITTER_MS, MAX_DELAY_MS } from "../../consts/connection";

afterEach(() => vi.restoreAllMocks());

describe("backoffDelay", () => {
    it("starts at 1000 ms and doubles with no jitter at random 0.5", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);

        expect(backoffDelay(0)).toBe(1000);
        expect(backoffDelay(1)).toBe(2000);
        expect(backoffDelay(2)).toBe(4000);
    });

    it("caps the base at 10 s", () => {
        vi.spyOn(Math, "random").mockReturnValue(0.5);

        expect(backoffDelay(4)).toBe(MAX_DELAY_MS);
        expect(backoffDelay(30)).toBe(MAX_DELAY_MS);
    });

    it("keeps the jitter within +-1000 ms", () => {
        const random = vi.spyOn(Math, "random");

        random.mockReturnValue(0);
        expect(backoffDelay(2)).toBe(4000 - JITTER_MS);

        random.mockReturnValue(1);
        expect(backoffDelay(2)).toBe(4000 + JITTER_MS);

        random.mockReturnValue(1);
        expect(backoffDelay(10)).toBe(MAX_DELAY_MS + JITTER_MS);
    });
});
