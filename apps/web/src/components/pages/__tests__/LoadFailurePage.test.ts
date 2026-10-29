// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOAD_FAILURE_MESSAGES } from "@/consts/load-failure-messages";
import { LoadFailurePage } from "../LoadFailurePage";

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
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

const render = (isOnline: boolean) => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(isOnline);
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    act(() => root.render(createElement(LoadFailurePage)));
    return reload;
};

describe("LoadFailurePage", () => {
    it("says there is no connection when the browser is offline", () => {
        render(false);

        expect(container.textContent).toContain(
            LOAD_FAILURE_MESSAGES.OFFLINE_TITLE
        );
    });

    it("says the page failed to load when the browser is online", () => {
        render(true);

        expect(container.textContent).toContain(
            LOAD_FAILURE_MESSAGES.FAILED_TITLE
        );
    });

    it("loads the page again when the button is pressed", () => {
        const reload = render(true);

        act(() => container.querySelector("button")!.click());

        expect(reload).toHaveBeenCalledOnce();
    });

    it("loads the page again by itself when the connection comes back", () => {
        const reload = render(false);

        act(() => {
            window.dispatchEvent(new Event("online"));
        });

        expect(reload).toHaveBeenCalledOnce();
    });

    it("changes its words when the connection goes", () => {
        render(true);

        act(() => {
            window.dispatchEvent(new Event("offline"));
        });

        expect(container.textContent).toContain(
            LOAD_FAILURE_MESSAGES.OFFLINE_TITLE
        );
    });
});
