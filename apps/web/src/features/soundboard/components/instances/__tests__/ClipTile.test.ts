import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { SoundboardClip } from "@standin/contracts";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ClipPlayback, ClipPreview } from "../../../types/playback";
import type {
    TileActionsComponent,
    TileOverlayComponent,
} from "../../../types/tile";
import { makeClip } from "../../../utils/__tests__/clipFixtures";
import { CallTileOverlay } from "../CallTileOverlay";
import { ClipPlaybackProviders } from "../ClipPlaybackProviders";
import { ClipTile } from "../ClipTile";
import { ManageTileOverlay } from "../ManageTileOverlay";
import { NoTileActions } from "../NoTileActions";

// The dialogs of the manager reach the API client, which reads its address
// from the environment.
vi.mock("@/lib/api/url", () => ({
    API_BASE_URL: "http://api",
    SOCKET_URL: "http://api",
    SOCKET_PATH_OPTIONS: {},
}));

let root: Root | null = null;
let container: HTMLDivElement | null = null;

type Options = {
    clip?: SoundboardClip;
    playback?: Partial<ClipPlayback>;
    preview?: Partial<ClipPreview>;
    Overlay?: TileOverlayComponent;
    Actions?: TileActionsComponent;
};

const render = ({
    clip = makeClip("a"),
    playback = {},
    preview = {},
    Overlay = CallTileOverlay,
    Actions = NoTileActions,
}: Options = {}) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const play = vi.fn(() => Promise.resolve());
    const previewPlay = vi.fn(() => Promise.resolve());
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() =>
        mounted.render(
            createElement(TooltipProvider, {
                children: createElement(ClipPlaybackProviders, {
                    playback: {
                        disabledReason: null,
                        isAtLimit: false,
                        playingClipIds: new Set<string>(),
                        play,
                        ...playback,
                    },
                    preview: {
                        disabledReason: null,
                        isAtLimit: false,
                        playingClipIds: new Set<string>(),
                        play: previewPlay,
                        stop: vi.fn(),
                        ...preview,
                    },
                    children: createElement("ul", {
                        children: createElement(ClipTile, {
                            clip,
                            Overlay,
                            Actions,
                        }),
                    }),
                }),
            })
        )
    );
    const byLabel = (label: string) =>
        host.querySelector<HTMLButtonElement>(`[aria-label^='${label}']`);
    return {
        host,
        frame: host.querySelector("li"),
        play,
        previewPlay,
        playButton: byLabel("Tocar Clip a na chamada"),
        previewButton: byLabel("Prévia de"),
        byLabel,
    };
};

describe("ClipTile in the panel", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("plays the clip into the call when its body is tapped", () => {
        const { host, play } = render();

        act(() =>
            host
                .querySelector<HTMLButtonElement>("[aria-label='Tocar Clip a']")
                ?.click()
        );

        expect(play).toHaveBeenCalledTimes(1);
    });

    it("has the play button on the right and the preview button on the left", () => {
        const { host } = render();
        const labels = [...host.querySelectorAll("button")].map((button) =>
            button.getAttribute("aria-label")
        );

        expect(labels).toEqual([
            "Tocar Clip a",
            "Prévia de Clip a",
            "Tocar Clip a na chamada",
        ]);
    });

    it("plays into the call from the play button", () => {
        const { playButton, play, previewPlay } = render();

        act(() => playButton?.click());

        expect(play).toHaveBeenCalledTimes(1);
        expect(previewPlay).not.toHaveBeenCalled();
    });

    it("listens alone from the preview button and sends nothing to the call", () => {
        const { previewButton, play, previewPlay } = render();

        act(() => previewButton?.click());

        expect(previewPlay).toHaveBeenCalledTimes(1);
        expect(play).not.toHaveBeenCalled();
    });

    it("has no stop or pause control, even while the clip plays", () => {
        const { host } = render({
            playback: { playingClipIds: new Set(["a"]) },
        });

        expect(host.querySelector("[aria-label^='Parar']")).toBeNull();
        expect(host.querySelector("[aria-label^='Pausar']")).toBeNull();
    });

    it("disables the play button and the body for a reason, but not the preview", () => {
        const { host, playButton, previewButton } = render({
            playback: { disabledReason: "Sem microfone" },
        });

        expect(playButton?.disabled).toBe(true);
        expect(
            host.querySelector<HTMLButtonElement>("[aria-label='Tocar Clip a']")
                ?.disabled
        ).toBe(true);
        expect(previewButton?.disabled).toBe(false);
    });

    it("disables every button that plays at the limit, with no reason", () => {
        const { host, playButton, previewButton } = render({
            playback: { isAtLimit: true },
        });

        expect(playButton?.disabled).toBe(true);
        expect(
            host.querySelector<HTMLButtonElement>("[aria-label='Tocar Clip a']")
                ?.disabled
        ).toBe(true);
        expect(previewButton?.disabled).toBe(false);
    });

    it("enables them again when the limit is lifted", () => {
        const { playButton, host } = render({ playback: { isAtLimit: false } });

        expect(playButton?.disabled).toBe(false);
        expect(
            host.querySelector<HTMLButtonElement>("[aria-label='Tocar Clip a']")
                ?.disabled
        ).toBe(false);
    });

    it("does not play from a click at the limit", () => {
        const { host, play } = render({ playback: { isAtLimit: true } });

        act(() =>
            host
                .querySelector<HTMLButtonElement>("[aria-label='Tocar Clip a']")
                ?.click()
        );

        expect(play).not.toHaveBeenCalled();
    });

    it("gives the overlay over the tile and fades the label on hover", () => {
        const { host } = render();

        expect(
            host.querySelector(".group-hover\\/tile\\:opacity-100")
        ).not.toBeNull();
        expect(
            host.querySelector(".group-hover\\/tile\\:opacity-20")
        ).not.toBeNull();
    });

    it("has no tooltip and no title on the body of the tile", () => {
        const { host } = render();
        const body = host.querySelector("[aria-label='Tocar Clip a']");

        expect(body?.hasAttribute("title")).toBe(false);
        expect(body?.getAttribute("data-slot")).not.toBe("tooltip-trigger");
        expect(body?.parentElement?.getAttribute("data-slot")).not.toBe(
            "tooltip-trigger"
        );
        expect(body?.getAttribute("aria-label")).toBe("Tocar Clip a");
    });

    it("has a tooltip on the preview and play buttons only", () => {
        const { host } = render();
        const triggers = host.querySelectorAll("[data-slot='tooltip-trigger']");

        expect(triggers).toHaveLength(2);
        expect(
            [...triggers].map((trigger) =>
                trigger.querySelector("button")?.getAttribute("aria-label")
            )
        ).toEqual(["Prévia de Clip a", "Tocar Clip a na chamada"]);
    });

    it("has no other action in the panel", () => {
        const { host } = render({
            clip: { ...makeClip("a"), canManage: true },
        });

        expect(host.querySelector("[aria-label='Mais opções']")).toBeNull();
    });
});

describe("ClipTile frame", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("has a background that shows on the card and a transparent border", () => {
        const { frame } = render();

        expect(frame?.className).toContain("bg-foreground/10");
        expect(frame?.className).toContain("border-transparent");
        expect(frame?.className).toContain("hover:border-border");
        expect(frame?.className).toContain("active:border-primary");
    });

    it("changes only the border while the clip plays", () => {
        const idle = render().frame?.className ?? "";
        act(() => root?.unmount());
        container?.remove();

        const { frame } = render({
            playback: { playingClipIds: new Set(["a"]) },
        });

        expect(frame?.className).toContain("border-primary");
        expect(frame?.className).not.toContain("bg-primary");
        expect(frame?.className).toContain("bg-foreground/10");
        expect(idle).not.toContain("border-primary hover");
    });

    it("is highlighted when its clip is among several that play", () => {
        const { frame } = render({
            playback: { playingClipIds: new Set(["other", "a", "third"]) },
        });

        expect(frame?.className).toMatch(/(^| )border-primary( |$)/);
    });

    it("is not highlighted while another clip plays", () => {
        const { frame } = render({
            playback: { playingClipIds: new Set(["other"]) },
        });

        expect(frame?.className).not.toMatch(/(^| )border-primary( |$)/);
    });
});

describe("ClipTile in the manager", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    const labelsOf = (host: HTMLElement) =>
        [...host.querySelectorAll("button")].map((button) =>
            button.getAttribute("aria-label")
        );

    it("has the preview icon at the left and the actions trigger at the right", () => {
        const { host } = render({
            clip: { ...makeClip("a"), canManage: true },
            Overlay: ManageTileOverlay,
        });

        expect(labelsOf(host)).toEqual([
            "Tocar Clip a",
            "Prévia de Clip a",
            "Ações",
        ]);
    });

    it("shows only the preview icon for a clip the person may not change", () => {
        const { host } = render({
            clip: { ...makeClip("a"), canManage: false },
            Overlay: ManageTileOverlay,
        });

        expect(labelsOf(host)).toEqual(["Tocar Clip a", "Prévia de Clip a"]);
        expect(host.querySelector("[aria-label='Ações']")).toBeNull();
    });

    it("uses the overlay of the panel: same frame, same inset, centered", () => {
        const panel = render({ Overlay: CallTileOverlay }).host.querySelector(
            ".pointer-events-none.absolute"
        );
        const panelClasses = panel?.className ?? "";
        act(() => root?.unmount());
        container?.remove();

        const manager = render({
            clip: { ...makeClip("a"), canManage: true },
            Overlay: ManageTileOverlay,
        }).host.querySelector(".pointer-events-none.absolute");

        expect(manager?.className).toBe(panelClasses);
        expect(manager?.className).toContain("items-center");
        expect(manager?.className).toContain("justify-between");
    });

    it("keeps the overlay in sight while the actions menu is open", () => {
        const { host } = render({
            clip: { ...makeClip("a"), canManage: true },
            Overlay: ManageTileOverlay,
        });

        const overlay = host.querySelector(".pointer-events-none.absolute");
        expect(overlay?.className).toContain(
            "has-[[aria-expanded=true]]:opacity-100"
        );
        expect(overlay?.className).toContain("group-hover/tile:opacity-100");
    });

    it("gives the actions trigger a bare icon look and a tooltip", () => {
        const { host } = render({
            clip: { ...makeClip("a"), canManage: true },
            Overlay: ManageTileOverlay,
        });
        const trigger = host.querySelector("[aria-label='Ações']");

        expect(trigger?.className).toContain("bg-transparent");
        expect(trigger?.className).toContain("p-0");
        expect(trigger?.className).toContain("[&_svg]:size-5");
        expect(trigger?.parentElement?.getAttribute("data-slot")).toBe(
            "tooltip-trigger"
        );
    });

    it("has no centered preview and no strip behind the actions", () => {
        const { host } = render({
            clip: { ...makeClip("a"), canManage: true },
            Overlay: ManageTileOverlay,
        });

        expect(host.innerHTML).not.toContain("mx-auto");
        expect(host.innerHTML).not.toContain("rounded-r-lg bg-muted");
    });

    it("does not turn the preview icon primary while previewing", () => {
        const { previewButton } = render({
            clip: { ...makeClip("a"), canManage: true },
            Overlay: ManageTileOverlay,
            playback: { playingClipIds: new Set(["a"]) },
            preview: { playingClipIds: new Set(["a"]) },
        });

        expect(previewButton?.hasAttribute("aria-pressed")).toBe(false);
    });

    it("keeps the primary border of the tile while previewing", () => {
        const { frame } = render({
            Overlay: ManageTileOverlay,
            playback: { playingClipIds: new Set(["a"]) },
        });

        expect(frame?.className).toMatch(/(^| )border-primary( |$)/);
    });

    it("still turns the preview icon primary in the panel", () => {
        const { previewButton } = render({
            Overlay: CallTileOverlay,
            preview: { playingClipIds: new Set(["a"]) },
        });

        expect(previewButton?.getAttribute("aria-pressed")).toBe("true");
    });

    it("previews from the icon and from the body, and plays nothing into a call", () => {
        const { host, previewPlay, previewButton } = render({
            Overlay: ManageTileOverlay,
        });

        act(() => previewButton?.click());

        expect(previewPlay).toHaveBeenCalledTimes(1);
        expect(
            host.querySelector("[aria-label='Tocar Clip a na chamada']")
        ).toBeNull();
    });
});
