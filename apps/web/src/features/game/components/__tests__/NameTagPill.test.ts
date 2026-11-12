// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

// The photo needs the API url of the environment, and the tag is what is under
// test, so a plain element stands in for it.
vi.mock("@/features/users/components/UserAvatar", () => ({
    UserAvatar: () => createElement("img", { alt: "" }),
}));

import { NAME_TAG } from "@/features/game/consts/name-tag";
import { NameTagPill, type NameTagPillProps } from "../NameTagPill";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const BASE: NameTagPillProps = {
    name: "Ana",
    isLocal: false,
    isDetailed: false,
    userId: "u1",
    profilePictureUrl: null,
};

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (props: Partial<NameTagPillProps>): HTMLDivElement => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root?.render(createElement(NameTagPill, { ...BASE, ...props })));
    return container;
};

afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
});

const moon = (view: HTMLElement) => view.querySelector("svg.lucide-moon");
const chat = (view: HTMLElement) =>
    view.querySelector("svg.lucide-message-circle");

describe("NameTagPill away mark", () => {
    it("shows no moon for a person in the office", () => {
        const view = render({});

        expect(moon(view)).toBeNull();
    });

    it("shows the moon in place of the dot when the person is away", () => {
        const view = render({ isAway: true });

        expect(moon(view)).not.toBeNull();
    });

    it("keeps the name next to the moon", () => {
        const view = render({ isAway: true });

        expect(view.textContent).toContain("Ana");
    });

    it("shows the moon over the typing icon", () => {
        const view = render({ isAway: true, isTyping: true });

        expect(moon(view)).not.toBeNull();
        expect(chat(view)).toBeNull();
    });

    it("still shows the typing icon for a person who is in the office", () => {
        const view = render({ isTyping: true });

        expect(chat(view)).not.toBeNull();
        expect(moon(view)).toBeNull();
    });

    it("greys the badge of the photo when the person is away", () => {
        const view = render({ isAway: true, isDetailed: true });
        const badge = [...view.querySelectorAll("span")].find(
            (node) => node.style.borderRadius === "50%"
        );

        expect(badge?.style.backgroundColor).toBe(
            hexToRgb(NAME_TAG.AWAY_DOT_COLOR)
        );
    });

    it("keeps the green badge of the photo for a person in the office", () => {
        const view = render({ isDetailed: true });
        const badge = [...view.querySelectorAll("span")].find(
            (node) => node.style.borderRadius === "50%"
        );

        expect(badge?.style.backgroundColor).toBe(hexToRgb(NAME_TAG.DOT_COLOR));
    });
});

// jsdom reports inline colors as rgb().
function hexToRgb(hex: string): string {
    const value = parseInt(hex.slice(1), 16);
    return `rgb(${value >> 16}, ${(value >> 8) & 255}, ${value & 255})`;
}
