// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/spaces/components/pages/space-page/layout", () => ({
    SpacePageLayout: {
        ControlGroup: ({ children }: { children: ReactNode }) =>
            createElement("div", null, children),
    },
}));
vi.mock("../../UserAvatar", () => ({
    UserAvatar: () => createElement("img", { alt: "" }),
}));
vi.mock("../UserStatusPanel", () => ({
    UserStatusPanel: () => createElement("div", { "data-testid": "card" }),
}));

import { AwayBar } from "../AwayBar";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (
    props: Partial<Parameters<typeof AwayBar>[0]> = {}
): { view: HTMLDivElement; onReturn: () => void } => {
    const onReturn = vi.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() =>
        root?.render(
            createElement(AwayBar, {
                id: "u1",
                name: "Ana",
                customStatus: null,
                onReturn,
                ...props,
            })
        )
    );
    return { view: container, onReturn };
};

afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    root = null;
    container = null;
});

const click = (node: Element | null) =>
    act(() => {
        node?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

describe("AwayBar", () => {
    it("shows the name and that the person is away", () => {
        const { view } = render();

        expect(view.textContent).toContain("Ana");
        expect(view.textContent).toContain("Ausente");
    });

    it("shows the custom status of the person", () => {
        const { view } = render({
            customStatus: { text: "Lunch", emoji: "🍕", expiresAt: null },
        });

        expect(view.textContent).toContain("Lunch");
    });

    it("returns to the office with the button", () => {
        const { view, onReturn } = render();

        click(
            [...view.querySelectorAll("button")].find(
                (b) => b.textContent === "Voltar"
            ) ?? null
        );

        expect(onReturn).toHaveBeenCalledTimes(1);
    });

    it("opens and closes the card of the own status from the avatar", () => {
        const { view } = render();
        const avatar = view.querySelector("button[aria-label='Ana']");
        expect(view.querySelector("[data-testid='card']")).toBeNull();

        click(avatar);
        expect(view.querySelector("[data-testid='card']")).not.toBeNull();

        click(avatar);
        expect(view.querySelector("[data-testid='card']")).toBeNull();
    });

    it("draws no other control of the bar", () => {
        const { view } = render();

        expect(view.querySelectorAll("button")).toHaveLength(2);
    });
});
