import { afterEach, describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { VirtualRowFrame } from "../list/VirtualRowFrame";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (collapsed: boolean, height = 48) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() =>
        mounted.render(
            createElement(VirtualRowFrame, {
                start: 96,
                height,
                collapsed,
                children: createElement("i"),
            })
        )
    );
    return host.firstElementChild;
};

describe("VirtualRowFrame", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("is put where it belongs by its offset and height", () => {
        const frame = render(false);

        expect(frame?.getAttribute("style")).toContain("height: 48px");
        expect(frame?.getAttribute("style")).toContain("translateY(96px)");
    });

    it("moves with the easing of the card rows", () => {
        const classes = render(false)?.className ?? "";

        expect(classes).toContain("transition-[transform,height,opacity]");
        expect(classes).toContain("duration-200");
        expect(classes).toContain("ease-out");
        expect(classes).toContain("motion-reduce:transition-none");
    });

    it("clips its content, so a row that shrinks does not spill", () => {
        expect(render(false)?.className).toContain("overflow-hidden");
    });

    it("is visible and reachable while its group is open", () => {
        const frame = render(false);

        expect(frame?.className).not.toContain("opacity-0");
        expect(frame?.hasAttribute("inert")).toBe(false);
    });

    it("fades out, shrinks to nothing and is inert while its group is folded", () => {
        const frame = render(true, 0);

        expect(frame?.className).toContain("opacity-0");
        expect(frame?.hasAttribute("inert")).toBe(true);
        expect(frame?.getAttribute("aria-hidden")).toBe("true");
        expect(frame?.getAttribute("style")).toContain("height: 0px");
    });
});
