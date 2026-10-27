import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../createRateLimiter";

const build = () => {
    let time = 0;
    const limiter = createRateLimiter({
        limits: { slow: { perSecond: 1, burst: 2 } },
        fallback: { perSecond: 10, burst: 3 },
        now: () => time,
    });
    return {
        limiter,
        advance: (ms: number) => {
            time += ms;
        },
    };
};

describe("createRateLimiter", () => {
    it("lets the burst through and refuses what comes after", () => {
        const { limiter } = build();

        expect(limiter.allow("slow")).toBe(true);
        expect(limiter.allow("slow")).toBe(true);
        expect(limiter.allow("slow")).toBe(false);
    });

    it("gives tokens back as time passes", () => {
        const { limiter, advance } = build();
        limiter.allow("slow");
        limiter.allow("slow");

        advance(1000);

        expect(limiter.allow("slow")).toBe(true);
        expect(limiter.allow("slow")).toBe(false);
    });

    it("never refills past the burst", () => {
        const { limiter, advance } = build();
        advance(60_000);

        expect(limiter.allow("slow")).toBe(true);
        expect(limiter.allow("slow")).toBe(true);
        expect(limiter.allow("slow")).toBe(false);
    });

    it("keeps each event on its own bucket and uses the fallback for the rest", () => {
        const { limiter } = build();
        limiter.allow("slow");
        limiter.allow("slow");
        limiter.allow("slow");

        expect(limiter.allow("other")).toBe(true);
        expect(limiter.allow("other")).toBe(true);
        expect(limiter.allow("other")).toBe(true);
        expect(limiter.allow("other")).toBe(false);
    });
});

describe("createRateLimiter with names the client invents", () => {
    it("shares one bucket between every name without a limit", () => {
        const { limiter } = build();

        expect(limiter.allow("made-up-1")).toBe(true);
        expect(limiter.allow("made-up-2")).toBe(true);
        expect(limiter.allow("made-up-3")).toBe(true);
        expect(limiter.allow("made-up-4")).toBe(false);
    });
});
