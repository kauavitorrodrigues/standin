import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NearbyChatForm } from "../../components/forms/NearbyChatForm";
import { NearbyChatHeader } from "../../components/views/NearbyChatHeader";
import { useNearbyComposer } from "../useNearbyComposer";

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const onSend = vi.fn();
const onTyping = vi.fn();

const Harness = ({ isOpen }: { isOpen: boolean }) => {
    const composer = useNearbyComposer({ isOpen, onSend, onTyping });

    return createElement(
        "div",
        null,
        createElement(NearbyChatHeader, {
            counter: composer.counter,
            shakeCount: composer.shakeCount,
            onClose: () => {},
        }),
        createElement(NearbyChatForm, { composer, isOpen })
    );
};

let container: HTMLDivElement;
let root: Root;

const render = (isOpen = true) =>
    act(() => root.render(createElement(Harness, { isOpen })));

const getInput = () => container.querySelector("input") as HTMLInputElement;
const getHeader = () => container.querySelector("div > div") as HTMLElement;

const type = (value: string) =>
    act(() => {
        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        )?.set;
        setter?.call(getInput(), value);
        getInput().dispatchEvent(new Event("input", { bubbles: true }));
    });

const submit = () =>
    act(async () => {
        container.querySelector("form")?.requestSubmit();
    });

describe("useNearbyComposer", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        onSend.mockClear();
        onTyping.mockClear();
        container = document.createElement("div");
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        vi.useRealTimers();
    });

    it("shows the counter from 35 characters and the warning from 40", () => {
        render();

        type("a".repeat(34));
        expect(getHeader().textContent).not.toContain("/50");

        type("a".repeat(35));
        expect(getHeader().textContent).toContain("35/50");

        type("a".repeat(40));
        const counter = container.querySelector('[data-tone="warning"]');
        expect(counter?.textContent).toBe("40/50");
    });

    it("sends the text, empties the field and keeps the focus", async () => {
        render();
        getInput().focus();
        type("  oi pessoal  ");

        await submit();

        expect(onSend).toHaveBeenCalledWith("oi pessoal");
        expect(getInput().value).toBe("");
        expect(document.activeElement).toBe(getInput());
    });

    it("does not send an empty text", async () => {
        render();
        type("   ");

        await submit();

        expect(onSend).not.toHaveBeenCalled();
    });

    it("blocks a text of 51 characters and marks the counter in red", async () => {
        render();
        type("a".repeat(51));

        await submit();

        expect(onSend).not.toHaveBeenCalled();
        expect(getInput().value).toBe("a".repeat(51));
        expect(container.querySelector('[data-tone="error"]')).not.toBeNull();
    });

    it("shakes the header when a text that is too long is sent", async () => {
        const animate = vi.fn();
        render();
        getHeader().animate = animate;
        type("a".repeat(51));

        await submit();

        expect(animate).toHaveBeenCalledTimes(1);
    });

    it("lets a link of 120 characters through", async () => {
        const link = `https://example.com/${"a".repeat(100)}`;
        render();
        type(link);

        await submit();

        expect(onSend).toHaveBeenCalledWith(link);
    });

    it("says typing on text, and false when it is sent", async () => {
        render();
        type("o");
        expect(onTyping).toHaveBeenLastCalledWith(true);

        await submit();

        expect(onTyping).toHaveBeenLastCalledWith(false);
    });

    it("says false when the field loses the focus", () => {
        render();
        getInput().focus();
        type("o");

        act(() => getInput().blur());

        expect(onTyping).toHaveBeenLastCalledWith(false);
    });

    it("says false when the panel closes", () => {
        render(true);
        type("o");

        render(false);

        expect(onTyping).toHaveBeenLastCalledWith(false);
    });

    it("keeps what was typed when the panel closes and opens again", () => {
        render(true);
        type("rascunho");

        render(false);
        render(true);

        expect(getInput().value).toBe("rascunho");
    });
});
