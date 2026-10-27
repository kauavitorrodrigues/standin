import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTypingBroadcast } from "@/features/chat/hooks/useTypingBroadcast";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const broadcast = vi.fn();
let root: Root;

const Harness = ({
    content,
    conversationId = "c1",
}: {
    content: string;
    conversationId?: string;
}) => {
    useTypingBroadcast({
        conversationId,
        content,
        broadcastTyping: broadcast,
    });
    return null;
};

const render = (content: string) =>
    act(() => root.render(createElement(Harness, { content })));

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("useTypingBroadcast", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        broadcast.mockClear();
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.useRealTimers();
    });

    it("sends nothing before the 1 s leading delay", () => {
        render("a");
        advance(999);
        expect(broadcast).not.toHaveBeenCalled();
        advance(1);
        expect(broadcast).toHaveBeenCalledExactlyOnceWith("c1", true);
    });

    it("emits one event after 1 s then one every 2 s while typing", () => {
        let text = "";
        const type = () => render((text += "a"));
        // Keystroke every 500 ms for 5 s.
        for (let i = 0; i < 10; i++) {
            type();
            advance(500);
        }
        const trues = broadcast.mock.calls.filter(([, v]) => v === true);
        expect(trues).toHaveLength(3);
        expect(broadcast.mock.calls.some(([, v]) => v === false)).toBe(false);
    });

    it("sends stop after 2 s idle and restarts with the leading delay", () => {
        render("a");
        advance(1000);
        broadcast.mockClear();
        advance(1000);
        expect(broadcast).toHaveBeenCalledExactlyOnceWith("c1", false);

        broadcast.mockClear();
        render("ab");
        advance(1000);
        expect(broadcast).toHaveBeenCalledExactlyOnceWith("c1", true);
    });

    it("sends stop immediately when content is cleared after a send", () => {
        render("a");
        advance(1000);
        broadcast.mockClear();
        render("");
        expect(broadcast).toHaveBeenCalledExactlyOnceWith("c1", false);
    });

    it("sends nothing when cleared before the first event", () => {
        render("a");
        advance(500);
        render("");
        advance(5000);
        expect(broadcast).not.toHaveBeenCalled();
    });

    it("tells the previous conversation to stop when the person moves to another", () => {
        act(() =>
            root.render(createElement(Harness, { content: "a" }))
        );
        advance(1000);
        broadcast.mockClear();

        act(() =>
            root.render(
                createElement(Harness, { content: "", conversationId: "c2" })
            )
        );

        expect(broadcast).toHaveBeenCalledWith("c1", false);
    });
});
