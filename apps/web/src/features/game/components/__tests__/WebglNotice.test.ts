// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WEBGL_MESSAGES } from "@/features/game/consts/webgl-messages";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const probe = vi.hoisted(() => ({
    value: { status: "ok", renderer: null } as {
        status: string;
        renderer: string | null;
    },
}));
vi.mock("@/features/game/utils/probeWebgl", () => ({
    getWebglProbe: () => probe.value,
}));

import { WebglNotice } from "../WebglNotice";

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

const render = (status: string) => {
    probe.value = { status, renderer: null };
    act(() => root.render(createElement(WebglNotice)));
};

describe("WebglNotice", () => {
    it("shows nothing when WebGL works", () => {
        render("ok");

        expect(container.textContent).toBe("");
    });

    it("tells that the space cannot be shown when there is no WebGL", () => {
        render("unsupported");

        expect(container.textContent).toContain(
            WEBGL_MESSAGES.UNSUPPORTED_TITLE
        );
        expect(container.querySelector("button")).toBeNull();
    });

    it("warns about a slow space with a software renderer, and can be closed", () => {
        render("software");

        expect(container.textContent).toContain(WEBGL_MESSAGES.SOFTWARE_TITLE);

        act(() => container.querySelector("button")!.click());

        expect(container.textContent).toBe("");
    });
});
