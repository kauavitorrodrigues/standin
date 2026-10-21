import { describe, expect, it } from "vitest";
import { EMOTE_RATE_LIMIT } from "@/features/game/consts/emote";
import { EmoteRateLimiter } from "../EmoteRateLimiter";

const { MAX_EVENTS, WINDOW_MS } = EMOTE_RATE_LIMIT;

describe("EmoteRateLimiter", () => {
    it("lets a peer send up to the limit in a window", () => {
        const limiter = new EmoteRateLimiter();

        for (let index = 0; index < MAX_EVENTS; index += 1) {
            expect(limiter.allow("a", 0)).toBe(true);
        }
        expect(limiter.allow("a", 0)).toBe(false);
    });

    it("lets the peer send again once the window moves on", () => {
        const limiter = new EmoteRateLimiter();
        for (let index = 0; index < MAX_EVENTS; index += 1) {
            limiter.allow("a", 0);
        }

        expect(limiter.allow("a", WINDOW_MS)).toBe(true);
    });

    it("counts each peer on its own", () => {
        const limiter = new EmoteRateLimiter();
        for (let index = 0; index < MAX_EVENTS; index += 1) {
            limiter.allow("a", 0);
        }

        expect(limiter.allow("b", 0)).toBe(true);
    });

    it("forgets a peer that is removed", () => {
        const limiter = new EmoteRateLimiter();
        for (let index = 0; index < MAX_EVENTS; index += 1) {
            limiter.allow("a", 0);
        }
        limiter.remove("a");

        expect(limiter.allow("a", 0)).toBe(true);
    });
});

describe("EmoteRateLimiter with its own limit", () => {
    it("uses the limit it was given", () => {
        const limiter = new EmoteRateLimiter({
            MAX_EVENTS: 2,
            WINDOW_MS: 1000,
        });

        expect(limiter.allow("a", 0)).toBe(true);
        expect(limiter.allow("a", 10)).toBe(true);
        expect(limiter.allow("a", 20)).toBe(false);
        expect(limiter.allow("a", 1000)).toBe(true);
    });
});
