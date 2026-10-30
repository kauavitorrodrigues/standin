import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
    ADMIN_PAGE_LIBRARY,
    ORGANIZATION_PAGE_LIBRARY,
} from "../../../consts/library";
import type { ClipListLayout } from "../../../types/layout";

const mocks = vi.hoisted(
    (): { content: Array<{ search: string; layout: ClipListLayout }> } => ({
        content: [],
    })
);

vi.mock("@/lib/api/url", () => ({
    API_BASE_URL: "http://api",
    SOCKET_URL: "http://api",
    SOCKET_PATH_OPTIONS: {},
}));
vi.mock("../SoundboardLibraryContent", () => ({
    SoundboardLibraryContent: (props: {
        search: string;
        layout: ClipListLayout;
    }) => {
        mocks.content.push(props);
        return null;
    },
}));

import { SoundboardLibraryPage } from "../SoundboardLibraryPage";
import { TABLE_LIST_LAYOUT } from "../listLayouts";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (library = ORGANIZATION_PAGE_LIBRARY) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.content = [];
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() =>
        mounted.render(
            createElement(SoundboardLibraryPage, {
                library,
                description: "Uma descrição.",
            })
        )
    );
    return host;
};

describe("SoundboardLibraryPage", () => {
    beforeEach(() => {
        const data = new Map<string, string>();
        vi.stubGlobal("localStorage", {
            getItem: (key: string) => data.get(key) ?? null,
            setItem: (key: string, value: string) => void data.set(key, value),
        });
        vi.resetModules();
    });

    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
        vi.unstubAllGlobals();
    });

    it("has the title and the description", () => {
        const host = render();

        expect(host.textContent).toContain("Sons");
        expect(host.textContent).toContain("Uma descrição.");
    });

    it("has the search and then the upload in the header, and no view switch", () => {
        const host = render();
        const labels = [...host.querySelectorAll("button, input")].map(
            (element) => element.getAttribute("aria-label")
        );

        expect(labels).toEqual(["Buscar clipe", "Adicionar clipe"]);
    });

    it("has the search in the header, with a fixed width, and none in the body", () => {
        const host = render();
        const inputs = host.querySelectorAll("input");

        expect(inputs).toHaveLength(1);
        expect(inputs.item(0).parentElement?.className).toContain("w-64");
        expect(inputs.item(0).parentElement?.className).toContain("flex-none");
    });

    it("shows the table", () => {
        render();

        expect(mocks.content.at(-1)?.layout).toBe(TABLE_LIST_LAYOUT);
    });

    it("reads nothing from the browser storage", () => {
        const getItem = vi.fn();
        vi.stubGlobal("localStorage", { getItem, setItem: vi.fn() });

        render();

        expect(getItem).not.toHaveBeenCalled();
    });

    it("passes the search of the header to the list", async () => {
        vi.useFakeTimers();
        const host = render();
        const input = host.querySelector("input");

        act(() => {
            if (input) {
                const setter = Object.getOwnPropertyDescriptor(
                    HTMLInputElement.prototype,
                    "value"
                )?.set;
                setter?.call(input, "buzina");
                input.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
        act(() => vi.advanceTimersByTime(1000));
        vi.useRealTimers();

        expect(mocks.content.at(-1)?.search).toBe("buzina");
    });

    it("is the same page for the admin's library", () => {
        const host = render(ADMIN_PAGE_LIBRARY);

        expect(
            host.querySelector("[aria-label='Adicionar clipe']")
        ).not.toBeNull();
    });
});
