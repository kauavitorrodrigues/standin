import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NEARBY_TYPING_THROTTLE_MS } from "@/features/game/consts/nearby";
import { NearbyTypingNotifier } from "../NearbyTypingNotifier";

describe("NearbyTypingNotifier", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("sends true at once on the first change", () => {
        const send = vi.fn();
        new NearbyTypingNotifier(send).typing();

        expect(send).toHaveBeenCalledTimes(1);
        expect(send).toHaveBeenCalledWith(true);
    });

    it("sends the changes in a second once, at the end of the second", () => {
        const send = vi.fn();
        const notifier = new NearbyTypingNotifier(send);

        notifier.typing();
        vi.advanceTimersByTime(200);
        notifier.typing();
        vi.advanceTimersByTime(200);
        notifier.typing();
        expect(send).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(NEARBY_TYPING_THROTTLE_MS - 400 - 1);
        expect(send).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1);
        expect(send).toHaveBeenCalledTimes(2);
        expect(send).toHaveBeenLastCalledWith(true);
    });

    it("sends false on stop, and only after a true", () => {
        const send = vi.fn();
        const notifier = new NearbyTypingNotifier(send);

        notifier.stop();
        expect(send).not.toHaveBeenCalled();

        notifier.typing();
        notifier.stop();
        expect(send).toHaveBeenLastCalledWith(false);
        expect(send).toHaveBeenCalledTimes(2);
    });

    it("cancels the pending send on stop", () => {
        const send = vi.fn();
        const notifier = new NearbyTypingNotifier(send);

        notifier.typing();
        notifier.typing();
        notifier.stop();
        vi.advanceTimersByTime(NEARBY_TYPING_THROTTLE_MS * 2);

        expect(send.mock.calls).toEqual([[true], [false]]);
    });

    it("sends true at once again after a stop", () => {
        const send = vi.fn();
        const notifier = new NearbyTypingNotifier(send);

        notifier.typing();
        notifier.stop();
        notifier.typing();

        expect(send.mock.calls).toEqual([[true], [false], [true]]);
    });
});
