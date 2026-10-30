import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { SoundboardClip } from "@standin/contracts";
import { TooltipProvider } from "@/components/ui/tooltip";
import { makeClip } from "../../../utils/__tests__/clipFixtures";
import type { ClipPreview } from "../../../types/playback";
import { ClipPlaybackProviders } from "../ClipPlaybackProviders";

// The rows open dialogs, which reach the API client.
vi.mock("@/lib/api/url", () => ({
    API_BASE_URL: "http://api",
    SOCKET_URL: "http://api",
    SOCKET_PATH_OPTIONS: {},
}));

import { TableClipRow } from "../TableClipRow";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const playback = (playingClipIds: string[] = []): ClipPreview => ({
    disabledReason: null,
    isAtLimit: false,
    playingClipIds: new Set(playingClipIds),
    play: vi.fn(() => Promise.resolve()),
    stop: vi.fn(),
});

const mount = (
    node: ReturnType<typeof createElement>,
    playing: string[] = []
) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    const preview = playback(playing);
    act(() =>
        mounted.render(
            createElement(TooltipProvider, {
                children: createElement(ClipPlaybackProviders, {
                    playback: preview,
                    preview,
                    children: node,
                }),
            })
        )
    );
    const labels = [...host.querySelectorAll("button")].map((button) =>
        button.getAttribute("aria-label")
    );
    return { host, labels, preview };
};

const clip = (canManage: boolean): SoundboardClip => ({
    ...makeClip("a"),
    canManage,
    icon: "🎺",
    volume: 0.5,
    durationMs: 65_000,
    createdByName: "Ana",
});

describe("TableClipRow", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("shows the icon and the name, the duration and the buttons on a narrow list", () => {
        const { host } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 400 })
        );
        const text = host.textContent ?? "";

        expect(text).toContain("🎺");
        expect(text).toContain("Clip a");
        expect(text).toContain("1:05");
        expect(text).not.toContain("50%");
        expect(text).not.toContain("Ana");
    });

    it("adds the volume, the uploader and the date as the list widens", () => {
        const { host } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 })
        );
        const text = host.textContent ?? "";

        expect(text).toContain("50%");
        expect(text).toContain("Ana");
    });

    it("has the preview and the actions menu at the right for a clip the person manages", () => {
        const { labels } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 })
        );

        expect(labels).toEqual(["Prévia de Clip a", "Ações"]);
    });

    it("has only the preview for a clip the person may not change", () => {
        const { labels } = mount(
            createElement(TableClipRow, { clip: clip(false), widthPx: 900 })
        );

        expect(labels).toEqual(["Prévia de Clip a"]);
    });

    it("has a fixed height and a transparent accent that is primary while it is listened to", () => {
        const idle = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 })
        );
        const idleRow = idle.host.querySelector("[role='row']");
        expect(idleRow?.getAttribute("style")).toContain("height: 44px");
        expect(idleRow?.className).toContain("border-transparent");
        expect(idleRow?.className).not.toMatch(/(^| )border-primary( |$)/);
        act(() => root?.unmount());
        container?.remove();

        const active = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 }),
            ["a"]
        );
        expect(active.host.querySelector("[role='row']")?.className).toMatch(
            /(^| )border-primary( |$)/
        );
    });

    it("keeps the preview icon white while its clip is listened to", () => {
        const { host } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 }),
            ["a"]
        );

        expect(
            host
                .querySelector("[aria-label='Prévia de Clip a']")
                ?.hasAttribute("aria-pressed")
        ).toBe(false);
    });

    it("starts listening from the preview button", () => {
        const { host, preview } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 })
        );

        act(() =>
            host
                .querySelector<HTMLButtonElement>(
                    "[aria-label='Prévia de Clip a']"
                )
                ?.click()
        );

        expect(preview.play).toHaveBeenCalledTimes(1);
        expect(preview.stop).not.toHaveBeenCalled();
    });

    it("stops listening with a second click, while its clip is the one listened to", () => {
        const { host, preview } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 }),
            ["a"]
        );

        act(() =>
            host
                .querySelector<HTMLButtonElement>(
                    "[aria-label='Prévia de Clip a']"
                )
                ?.click()
        );

        expect(preview.stop).toHaveBeenCalledTimes(1);
        expect(preview.play).not.toHaveBeenCalled();
    });

    it("starts its clip when another one is the one listened to", () => {
        const { host, preview } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 }),
            ["other"]
        );

        act(() =>
            host
                .querySelector<HTMLButtonElement>(
                    "[aria-label='Prévia de Clip a']"
                )
                ?.click()
        );

        expect(preview.play).toHaveBeenCalledTimes(1);
        expect(preview.stop).not.toHaveBeenCalled();
    });

    it("previews from the button", () => {
        const { host, preview } = mount(
            createElement(TableClipRow, { clip: clip(true), widthPx: 900 })
        );

        act(() =>
            host
                .querySelector<HTMLButtonElement>(
                    "[aria-label='Prévia de Clip a']"
                )
                ?.click()
        );

        expect(preview.play).toHaveBeenCalledTimes(1);
    });
});
