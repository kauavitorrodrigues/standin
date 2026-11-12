// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { AwayLayer } from "../AwayLayer";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const mount = (isAway: boolean): HTMLDivElement => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root?.render(createElement(AwayLayer, { isAway })));
    return container;
};

afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
});

describe("AwayLayer", () => {
    it("draws nothing while the person is in the office", () => {
        const view = mount(false);

        expect(view.querySelector("[role='presentation']")).toBeNull();
    });

    it("covers the game while the person is away", () => {
        const view = mount(true);
        const layer = view.querySelector("[role='presentation']");

        expect(layer).not.toBeNull();
        expect(layer?.getAttribute("aria-label")).toBe("Você está ausente");
    });

    it("comes in when the person goes away", () => {
        const view = mount(false);

        act(() => root?.render(createElement(AwayLayer, { isAway: true })));

        expect(view.querySelector("[role='presentation']")).not.toBeNull();
    });
});
