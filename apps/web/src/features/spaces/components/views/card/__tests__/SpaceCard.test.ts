// @vitest-environment jsdom
import { act, createElement } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Space } from "@standin/contracts";

vi.mock("@tanstack/react-router", () => ({
    Link: ({
        children,
        className,
        style,
    }: {
        children: ReactNode;
        className?: string;
        style?: Record<string, string>;
    }) =>
        createElement(
            "a",
            { className, style, "data-testid": "link" },
            children
        ),
}));
vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "http://localhost:3001" }));
vi.mock("@/features/spaces/components/SpaceActions", () => ({
    SpaceActions: () => createElement("button", { "data-testid": "actions" }),
}));

import { SpaceCard } from "../SpaceCard";

const space: Space = {
    id: "s1",
    name: "Lobby",
    organizationId: "org-1",
    mapId: "m1",
    guestAccess: "ALLOWED",
    thumbnailUrl: null,
    createdAt: new Date().toISOString(),
};

let host: HTMLDivElement;
let root: Root;

const render = (overrides: Partial<Space> = {}) =>
    act(() =>
        root.render(
            createElement(SpaceCard, { space: { ...space, ...overrides } })
        )
    );

describe("SpaceCard", () => {
    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        host = document.createElement("div");
        root = createRoot(host);
    });
    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("shows the photo of the space inside the card", () => {
        render({ thumbnailUrl: "https://cdn/photo.png" });

        const link = host.querySelector("[data-testid=link]")!;
        expect(link.querySelector("img")?.getAttribute("src")).toBe(
            "https://cdn/photo.png"
        );
    });

    it("has no image for a space without a photo, only the gradient", () => {
        render({ thumbnailUrl: null });

        const link = host.querySelector("[data-testid=link]") as HTMLElement;
        expect(link.querySelector("img")).toBeNull();
        expect(link.style.backgroundImage).toContain("linear-gradient");
    });

    it("keeps the gradient behind the photo while it loads", () => {
        render({ thumbnailUrl: "https://cdn/photo.png" });

        const link = host.querySelector("[data-testid=link]") as HTMLElement;
        expect(link.style.backgroundImage).toContain("linear-gradient");
    });

    it("keeps the actions above the photo", () => {
        render({ thumbnailUrl: "https://cdn/photo.png" });

        const link = host.querySelector("[data-testid=link]")!;
        const children = [
            ...link.querySelectorAll("img, [data-testid=actions]"),
        ];
        expect(children.map((node) => node.tagName)).toEqual(["IMG", "BUTTON"]);
    });

    it("shows the name of the space", () => {
        render();

        expect(host.textContent).toContain("Lobby");
    });
});
