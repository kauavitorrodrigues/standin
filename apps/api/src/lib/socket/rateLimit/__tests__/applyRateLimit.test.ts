import { describe, expect, it, vi } from "vitest";
import { applyRateLimit } from "../applyRateLimit";
import { RATE_LIMITED_ACK } from "../limits";

type Middleware = (packet: unknown[], next: () => void) => void;

const setup = () => {
    let middleware: Middleware = () => undefined;
    const socket = {
        use: (fn: Middleware) => {
            middleware = fn;
        },
    };
    applyRateLimit(socket as never);
    return (packet: unknown[]) => {
        const next = vi.fn();
        middleware(packet, next);
        return next;
    };
};

describe("applyRateLimit", () => {
    it("lets an event under its limit through", () => {
        const send = setup();

        expect(send(["editor:acquire", {}, vi.fn()])).toHaveBeenCalledTimes(1);
    });

    it("drops an event over its limit and answers its ack with a refusal", () => {
        const send = setup();
        const ack = vi.fn();

        for (let i = 0; i < 5; i++) send(["editor:acquire", {}, ack]);
        const next = send(["editor:acquire", {}, ack]);

        expect(next).not.toHaveBeenCalled();
        expect(ack).toHaveBeenCalledWith(RATE_LIMITED_ACK);
    });

    it("drops an event without an ack silently", () => {
        const send = setup();

        for (let i = 0; i < 5; i++) send(["editor:acquire", {}]);

        expect(() => send(["editor:acquire", {}])).not.toThrow();
    });
});
