import { afterEach, describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClipPlayButton } from "../tile/PlayButton";
import { PlayTooltip } from "../tile/PlayTooltip";
import { PreviewTooltip } from "../tile/PreviewTooltip";
import { ClipPreviewButton } from "../tile/PreviewButton";
import { ClipTooltipContent } from "../tile/TooltipContent";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const mount = (node: ReturnType<typeof createElement>) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() =>
        mounted.render(createElement(TooltipProvider, { children: node }))
    );
};

const CLIP = { name: "Airhorn", icon: "🎺" };

// A tooltip held open, with the content under test in it.
const openTooltip = (content: ReturnType<typeof createElement>) =>
    createElement(Tooltip, {
        open: true,
        children: [
            createElement(TooltipTrigger, { key: "t", children: "x" }),
            content,
        ],
    });

describe("tile tooltips", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
        document.body.replaceChildren();
    });

    it("shows the label and then the name, on one line", () => {
        mount(
            createElement(Tooltip, {
                open: true,
                children: [
                    createElement(TooltipTrigger, { key: "t", children: "x" }),
                    createElement(ClipTooltipContent, {
                        key: "c",
                        label: "Tocar",
                        name: "Airhorn",
                    }),
                ],
            })
        );

        const line = document.body.querySelector("span.flex");
        expect(line?.textContent).toBe("TocarAirhorn");
        expect(line?.children).toHaveLength(2);
        expect(line?.children.item(0)?.className).toContain("opacity-70");
        // The color is the popup's own, so the label sets none of its own.
        expect(line?.innerHTML).not.toContain("text-background");
        expect(line?.innerHTML).not.toContain("text-muted-foreground");
    });

    it("shows the icon of the clip before the text", () => {
        mount(
            openTooltip(
                createElement(ClipTooltipContent, {
                    label: "Tocar",
                    name: "Airhorn",
                    icon: "🎺",
                })
            )
        );

        const line = document.body.querySelector("span.flex");
        expect(line?.textContent).toBe("🎺TocarAirhorn");
        expect(line?.children.item(0)?.textContent).toBe("🎺");
    });

    it("shows the speaker for a clip with no icon", () => {
        mount(
            openTooltip(
                createElement(ClipTooltipContent, {
                    label: "Tocar",
                    name: "Airhorn",
                    icon: null,
                })
            )
        );

        const line = document.body.querySelector("span.flex");
        expect(line?.querySelector("svg")).not.toBeNull();
    });

    it("shows only the label when there is no name", () => {
        mount(
            createElement(Tooltip, {
                open: true,
                children: [
                    createElement(TooltipTrigger, { key: "t", children: "x" }),
                    createElement(ClipTooltipContent, {
                        key: "c",
                        label: "Sem microfone",
                    }),
                ],
            })
        );

        const line = document.body.querySelector("span.flex");
        expect(line?.textContent).toBe("Sem microfone");
        expect(line?.children).toHaveLength(1);
    });

    it("says Tocar and the name on the play tooltip", () => {
        mount(
            openTooltip(
                createElement(PlayTooltip, { clip: CLIP, disabledReason: null })
            )
        );

        const line = document.body.querySelector("span.flex");
        expect(line?.textContent).toBe("🎺TocarAirhorn");
    });

    it("says only the reason on the play tooltip while it is disabled", () => {
        mount(
            openTooltip(
                createElement(PlayTooltip, {
                    clip: CLIP,
                    disabledReason: "Sem microfone",
                })
            )
        );

        const line = document.body.querySelector("span.flex");
        expect(line?.textContent).toBe("Sem microfone");
        expect(document.body.textContent).not.toContain("Airhorn");
        expect(document.body.textContent).not.toContain("🎺");
    });

    it("says Pré-visualizar and the name on the preview tooltip", () => {
        mount(openTooltip(createElement(PreviewTooltip, { clip: CLIP })));

        const line = document.body.querySelector("span.flex");
        expect(line?.textContent).toBe("🎺Pré-visualizarAirhorn");
    });

    it("hangs a tooltip on the play button even when it is disabled", () => {
        mount(
            createElement(ClipPlayButton, {
                clip: CLIP,
                disabledReason: "Sem microfone",
                isAtLimit: false,
                onPlay: () => undefined,
            })
        );

        const button = document.querySelector("button");
        expect(button?.disabled).toBe(true);
        expect(button?.parentElement?.tagName).toBe("SPAN");
    });

    it("disables the play button at the limit, still with its tooltip", () => {
        mount(
            createElement(ClipPlayButton, {
                clip: CLIP,
                disabledReason: null,
                isAtLimit: true,
                onPlay: () => undefined,
            })
        );

        const button = document.querySelector("button");
        expect(button?.disabled).toBe(true);
        expect(button?.parentElement?.tagName).toBe("SPAN");
    });

    it("keeps the normal tooltip at the limit, since it has no reason", () => {
        mount(
            openTooltip(
                createElement(PlayTooltip, { clip: CLIP, disabledReason: null })
            )
        );

        expect(document.body.querySelector("span.flex")?.textContent).toBe(
            "🎺TocarAirhorn"
        );
        expect(document.body.textContent).not.toContain("Máximo");
    });

    it("hangs a tooltip on the preview button", () => {
        mount(
            createElement(ClipPreviewButton, {
                clip: CLIP,
                isPreviewing: false,
                onPreview: () => undefined,
            })
        );

        expect(document.querySelector("button")?.parentElement?.tagName).toBe(
            "SPAN"
        );
    });
});
