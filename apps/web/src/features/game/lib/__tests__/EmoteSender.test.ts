import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMOTE_COMBO_MAX, EMOTE_COMBO_WINDOW_MS } from "@standin/contracts";
import { EmoteSender } from "../EmoteSender";

describe("EmoteSender", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("sends a lone click once the window passes", () => {
        const dispatch = vi.fn();
        const sender = new EmoteSender(dispatch);

        sender.send("👏");
        vi.advanceTimersByTime(EMOTE_COMBO_WINDOW_MS - 1);
        expect(dispatch).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(dispatch).toHaveBeenCalledWith({ emoji: "👏", count: 1 });
    });

    it("adds up clicks in the same emoji into one event", () => {
        const dispatch = vi.fn();
        const sender = new EmoteSender(dispatch);

        sender.send("👏");
        vi.advanceTimersByTime(EMOTE_COMBO_WINDOW_MS - 1);
        sender.send("👏");
        vi.advanceTimersByTime(EMOTE_COMBO_WINDOW_MS - 1);
        sender.send("👏");
        vi.advanceTimersByTime(EMOTE_COMBO_WINDOW_MS);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({ emoji: "👏", count: 3 });
    });

    it("closes the group when the emoji changes", () => {
        const dispatch = vi.fn();
        const sender = new EmoteSender(dispatch);

        sender.send("👏");
        sender.send("👏");
        sender.send("🎉");
        expect(dispatch).toHaveBeenCalledWith({ emoji: "👏", count: 2 });

        vi.advanceTimersByTime(EMOTE_COMBO_WINDOW_MS);
        expect(dispatch).toHaveBeenLastCalledWith({ emoji: "🎉", count: 1 });
        expect(dispatch).toHaveBeenCalledTimes(2);
    });

    it("sends the group at the limit and starts another", () => {
        const dispatch = vi.fn();
        const sender = new EmoteSender(dispatch);

        for (let click = 0; click <= EMOTE_COMBO_MAX; click += 1) {
            sender.send("❤️");
        }
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            emoji: "❤️",
            count: EMOTE_COMBO_MAX,
        });

        vi.advanceTimersByTime(EMOTE_COMBO_WINDOW_MS);
        expect(dispatch).toHaveBeenLastCalledWith({ emoji: "❤️", count: 1 });
    });

    it("drops the group waiting when destroyed", () => {
        const dispatch = vi.fn();
        const sender = new EmoteSender(dispatch);

        sender.send("👏");
        sender.destroy();
        vi.advanceTimersByTime(EMOTE_COMBO_WINDOW_MS * 2);

        expect(dispatch).not.toHaveBeenCalled();
    });
});
