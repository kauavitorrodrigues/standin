import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimit } from "../rateLimit";

const buildRes = () => {
    const res = { status: vi.fn(), json: vi.fn(), set: vi.fn() };
    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);
    return res;
};

const run = (
    limiter: ReturnType<typeof RateLimit>,
    req: { user?: { id: string }; ip?: string }
) => {
    const res = buildRes();
    const next = vi.fn();
    limiter(req as never, res as never, next);
    return { res, next };
};

describe("RateLimit", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });
    afterEach(() => vi.useRealTimers());

    it("lets the calls up to the limit through", () => {
        const limiter = RateLimit({ windowMs: 1000, max: 2 });

        expect(run(limiter, { user: { id: "u1" } }).next).toHaveBeenCalled();
        expect(run(limiter, { user: { id: "u1" } }).next).toHaveBeenCalled();
    });

    it("answers 429 with the wait once the limit is passed", () => {
        const limiter = RateLimit({ windowMs: 1000, max: 1 });
        run(limiter, { user: { id: "u1" } });

        const { res, next } = run(limiter, { user: { id: "u1" } });

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.set).toHaveBeenCalledWith("Retry-After", "1");
    });

    it("counts each person on their own", () => {
        const limiter = RateLimit({ windowMs: 1000, max: 1 });
        run(limiter, { user: { id: "u1" } });

        expect(run(limiter, { user: { id: "u2" } }).next).toHaveBeenCalled();
    });

    it("falls back to the address when nobody is signed in", () => {
        const limiter = RateLimit({ windowMs: 1000, max: 1 });
        run(limiter, { ip: "1.1.1.1" });

        expect(run(limiter, { ip: "1.1.1.1" }).next).not.toHaveBeenCalled();
        expect(run(limiter, { ip: "2.2.2.2" }).next).toHaveBeenCalled();
    });

    it("starts a new window after the time passes", () => {
        const limiter = RateLimit({ windowMs: 1000, max: 1 });
        run(limiter, { user: { id: "u1" } });
        vi.advanceTimersByTime(1001);

        expect(run(limiter, { user: { id: "u1" } }).next).toHaveBeenCalled();
    });

    it("keeps one limiter apart from another", () => {
        const first = RateLimit({ windowMs: 1000, max: 1 });
        const second = RateLimit({ windowMs: 1000, max: 1 });
        run(first, { user: { id: "u1" } });

        expect(run(second, { user: { id: "u1" } }).next).toHaveBeenCalled();
    });

    it("forgets the windows that ended, so the counts do not pile up", () => {
        const limiter = RateLimit({ windowMs: 1000, max: 1 });
        for (let i = 0; i < 50; i++) run(limiter, { user: { id: `u${i}` } });
        vi.advanceTimersByTime(2000);

        // A call after the sweep starts every person from zero again.
        expect(run(limiter, { user: { id: "u0" } }).next).toHaveBeenCalled();
        expect(run(limiter, { user: { id: "u49" } }).next).toHaveBeenCalled();
    });
});
