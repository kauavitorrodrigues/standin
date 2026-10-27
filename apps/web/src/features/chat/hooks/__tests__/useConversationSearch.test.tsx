import { act, createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const { searchMock } = vi.hoisted(() => ({ searchMock: vi.fn() }));

vi.mock("@/features/chat/queries", () => ({
    ChatQueries: { useSearchConversations: searchMock },
}));

import { useConversationSearch } from "../useConversationSearch";
import { CONVERSATION_SEARCH_DEBOUNCE_MS } from "@/features/chat/consts/search";

type Search = ReturnType<typeof useConversationSearch>;

let root: Root;
let latest: Search;

const Harness = () => {
    const value = useConversationSearch();
    useEffect(() => {
        latest = value;
    });
    return createElement("input", value.form.register("search"));
};

const press = (init: KeyboardEventInit) => {
    const event = new KeyboardEvent("keydown", {
        ...init,
        bubbles: true,
        cancelable: true,
    });
    act(() => {
        window.dispatchEvent(event);
    });
    return event;
};

describe("useConversationSearch", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        vi.useFakeTimers();
        searchMock.mockReset();
        searchMock.mockReturnValue({
            conversations: [],
            isLoading: false,
            isError: false,
        });
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
        act(() => root.render(createElement(Harness)));
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.useRealTimers();
    });

    it("focuses the field on Ctrl+F and cancels the browser find", () => {
        const input = container.querySelector("input");

        const event = press({ key: "f", ctrlKey: true });

        expect(document.activeElement).toBe(input);
        expect(event.defaultPrevented).toBe(true);
    });

    it("focuses the field on Cmd+F", () => {
        press({ key: "F", metaKey: true });

        expect(document.activeElement).toBe(container.querySelector("input"));
    });

    it("leaves a plain F key alone", () => {
        const event = press({ key: "f" });

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).not.toBe(
            container.querySelector("input")
        );
    });

    it("asks the server for the typed text only after the debounce", () => {
        act(() => latest.form.setValue("search", "  ana "));

        expect(latest.isSearching).toBe(true);
        expect(latest.results.isLoading).toBe(true);
        expect(searchMock).not.toHaveBeenLastCalledWith("ana");

        act(() => {
            vi.advanceTimersByTime(CONVERSATION_SEARCH_DEBOUNCE_MS);
        });

        expect(searchMock).toHaveBeenLastCalledWith("ana");
        expect(latest.results.isLoading).toBe(false);
    });
});
