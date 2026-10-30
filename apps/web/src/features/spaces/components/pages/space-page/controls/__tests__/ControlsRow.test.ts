import { afterEach, describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ControlsRow } from "../ControlsRow";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (isOpen: boolean) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    const mount = (open: boolean) =>
        act(() =>
            root!.render(
                createElement(ControlsRow, {
                    isOpen: open,
                    children: createElement("p", { id: "content" }, "content"),
                })
            )
        );
    mount(isOpen);
    return {
        mount,
        row: () =>
            container!.querySelector<HTMLElement>(
                "[data-slot='animated-collapse']"
            )!,
    };
};

describe("ControlsRow", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("is open and reachable while isOpen", () => {
        const { row } = render(true);

        expect(row().dataset.state).toBe("open");
        expect(row().hasAttribute("inert")).toBe(false);
    });

    it("keeps the children mounted but inert while closed", () => {
        const { row } = render(false);

        expect(row().dataset.state).toBe("closed");
        expect(row().hasAttribute("inert")).toBe(true);
        expect(row().getAttribute("aria-hidden")).toBe("true");
        expect(container!.querySelector("#content")).not.toBeNull();
    });

    it("follows isOpen as it changes", () => {
        const { row, mount } = render(false);

        mount(true);
        expect(row().dataset.state).toBe("open");

        mount(false);
        expect(row().dataset.state).toBe("closed");
    });

    it("takes the width of the card instead of widening it", () => {
        const { row } = render(true);

        expect(row().className).toContain("w-0");
        expect(row().className).toContain("min-w-full");
    });
});
