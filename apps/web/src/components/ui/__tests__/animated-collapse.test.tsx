// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AnimatedCollapse } from "../animated-collapse";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

const render = (open: boolean) =>
    act(() => {
        root.render(
            <AnimatedCollapse open={open}>
                <button>inside</button>
            </AnimatedCollapse>
        );
    });

const wrapper = () =>
    container.querySelector<HTMLElement>("[data-slot=animated-collapse]")!;

describe("AnimatedCollapse", () => {
    it("is interactive while open", () => {
        render(true);
        expect(wrapper().dataset.state).toBe("open");
        expect(wrapper().inert).toBe(false);
        expect(wrapper().getAttribute("aria-hidden")).toBe("false");
    });

    it("keeps the content mounted but inert and hidden while closed", () => {
        render(false);
        expect(wrapper().dataset.state).toBe("closed");
        expect(wrapper().inert).toBe(true);
        expect(wrapper().getAttribute("aria-hidden")).toBe("true");
        expect(container.querySelector("button")).not.toBeNull();
    });
});
