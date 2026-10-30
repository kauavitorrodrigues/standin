import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
    TILE_OVERLAY_ICON_SIZE_CLASS,
    TILE_OVERLAY_INSET_CLASS,
} from "../../../consts/tileOverlay";
import { ClipTileOverlay } from "../tile/TileOverlay";
import { TileIconButton } from "../tile/TileIconButton";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (props: { disabled?: boolean; pressed?: boolean } = {}) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const onClick = vi.fn();
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() =>
        mounted.render(
            createElement(TileIconButton, {
                label: "Tocar",
                onClick,
                ...props,
                children: createElement("svg"),
            })
        )
    );
    return { button: host.querySelector("button"), onClick };
};

describe("TileIconButton", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("is a bare icon: no box, no padding, no border", () => {
        const { button } = render();
        const classes = button?.className ?? "";

        expect(classes).toContain("bg-transparent");
        expect(classes).toContain("p-0");
        expect(classes).toContain("border-0");
        expect(classes).not.toMatch(/(^| )(hover|active):bg-/);
        expect(classes).not.toMatch(/(^| )size-\d/);
    });

    it("draws a small filled icon, from the size constant", () => {
        const { button } = render();

        expect(button?.className).toContain(TILE_OVERLAY_ICON_SIZE_CLASS);
        expect(button?.className).toContain("[&_svg]:fill-current");
        expect(button?.className).not.toContain("[&_svg]:size-6");
    });

    it("sits well inside the tile, by the inset constant", () => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        const host = document.createElement("div");
        document.body.append(host);
        const mounted = createRoot(host);
        container = host;
        root = mounted;
        act(() =>
            mounted.render(
                createElement(ClipTileOverlay, { children: createElement("i") })
            )
        );

        const overlay = host.firstElementChild;
        expect(overlay?.className).toContain(TILE_OVERLAY_INSET_CLASS);
        expect(overlay?.className).not.toContain("px-1 ");
        // As tall as the tile and centered on it, so the icons sit mid-height.
        expect(overlay?.className).toContain("inset-0");
        expect(overlay?.className).toContain("h-full");
        expect(overlay?.className).toContain("items-center");
    });

    it("is centered on its own line box, with no offset of its own", () => {
        const classes = render().button?.className ?? "";

        expect(classes).toMatch(/(^| )flex( |$)/);
        expect(classes).toContain("items-center");
        expect(classes).toContain("justify-center");
        expect(classes).toContain("leading-none");
        expect(classes).toContain("[&_svg]:block");
        expect(classes).not.toMatch(/(^| )m[trbl]?-/);
    });

    it("only dims or shrinks on hover and press", () => {
        const { button } = render();

        expect(button?.className).toContain("hover:opacity-70");
        expect(button?.className).toContain("active:scale-90");
    });

    it("keeps a ring for the keyboard focus", () => {
        const { button } = render();

        expect(button?.className).toContain("focus-visible:ring-2");
    });

    it("clicks, unless it is disabled", () => {
        const enabled = render();
        act(() => enabled.button?.click());
        expect(enabled.onClick).toHaveBeenCalledTimes(1);
    });

    it("does not click while disabled", () => {
        const { button, onClick } = render({ disabled: true });

        act(() => button?.click());

        expect(button?.disabled).toBe(true);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("says whether it is pressed", () => {
        expect(
            render({ pressed: true }).button?.getAttribute("aria-pressed")
        ).toBe("true");
    });
});
