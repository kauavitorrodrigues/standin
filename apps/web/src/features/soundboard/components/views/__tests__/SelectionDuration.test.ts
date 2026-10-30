import { afterEach, describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SelectionDuration } from "../editor/SelectionDuration";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (isOver: boolean) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() =>
        mounted.render(
            createElement(SelectionDuration, { durationMs: 5150, isOver })
        )
    );
    return host.querySelector("span");
};

describe("SelectionDuration", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("shows the length of the selection", () => {
        expect(render(false)?.textContent).toBe("5.15s");
    });

    it("is muted while the clip fits", () => {
        expect(render(false)?.className).toContain("text-muted-foreground");
    });

    it("is tinted when the clip is over a limit", () => {
        const span = render(true);

        expect(span?.className).toContain("text-destructive");
        expect(span?.className).not.toContain("text-muted-foreground");
    });
});
