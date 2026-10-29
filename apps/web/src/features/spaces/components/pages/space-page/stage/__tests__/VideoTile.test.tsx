// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StageTile } from "@/features/spaces/types/stage";

vi.mock("@/features/users/hooks/useProfilePictureOf", () => ({
    useProfilePictureOf: () => null,
}));
vi.mock("@/features/users/components/UserAvatar", () => ({
    UserAvatar: ({ name }: { name: string }) =>
        createElement("span", { "data-avatar": name }),
}));
vi.mock("@/features/media-devices/hooks/useMirrorSelfCameraPreference", () => ({
    useMirrorSelfCameraPreference: () => false,
}));
vi.mock("@/components/VideoElement", () => ({
    VideoElement: () => createElement("video", { "data-video": "" }),
}));

import { StageVideoActionsContext } from "../StageVideoActions";
import { VideoTile } from "../VideoTile";

(
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const stream = {} as MediaStream;

const tile = (overrides: Partial<StageTile> = {}): StageTile => ({
    id: "u1:camera",
    slot: "camera",
    stream,
    userId: "u1",
    label: "Ana",
    isSelf: false,
    isMuted: false,
    notice: null,
    ...overrides,
});

let container: HTMLDivElement;
let root: Root;

const render = (
    node: StageTile,
    actions: { hideVideo?: (id: string) => void; showVideo?: (id: string) => void } = {},
    onSelect?: () => void
) => {
    act(() => {
        root.render(
            createElement(
                StageVideoActionsContext.Provider,
                { value: actions },
                createElement(VideoTile, { tile: node, onSelect })
            )
        );
    });
};

const button = (label: string) =>
    container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);

describe("VideoTile", () => {
    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    it("plays the video of a tile with no notice", () => {
        render(tile());

        expect(container.querySelector("video")).not.toBeNull();
        expect(container.querySelector("[role=status]")).toBeNull();
    });

    it("says why a video is held back instead of showing a frozen picture", () => {
        render(tile({ notice: "client-limit" }));

        expect(container.querySelector("video")).toBeNull();
        const status = container.querySelector("[role=status]")!;
        expect(status.getAttribute("aria-label")).toBe(
            "Vídeo pausado para economizar a sua máquina"
        );
        expect(status.textContent).toContain("Pausado para economizar a sua máquina");
    });

    it("says the server is the reason when it is", () => {
        render(tile({ notice: "server-limit" }));

        expect(container.querySelector("[role=status]")!.textContent).toContain(
            "servidor"
        );
    });

    it("shows a hidden person as an avatar that says the video is hidden", () => {
        render(tile({ stream: null, notice: "user-hidden" }));

        expect(container.querySelector("[data-avatar]")).not.toBeNull();
        expect(container.querySelector("[role=status]")!.textContent).toContain(
            "Vídeo oculto"
        );
    });

    it("offers to hide the video of somebody else, and only that", () => {
        const hideVideo = vi.fn();
        const onSelect = vi.fn();
        render(tile(), { hideVideo, showVideo: vi.fn() }, onSelect);

        act(() => button("Ocultar vídeo")!.click());

        expect(hideVideo).toHaveBeenCalledWith("u1");
        // The click does not open the tile behind it.
        expect(onSelect).not.toHaveBeenCalled();
        expect(button("Mostrar vídeo")).toBeNull();
    });

    it("offers to show the video of a hidden person", () => {
        const showVideo = vi.fn();
        render(tile({ stream: null, notice: "user-hidden" }), {
            hideVideo: vi.fn(),
            showVideo,
        });

        act(() => button("Mostrar vídeo")!.click());

        expect(showVideo).toHaveBeenCalledWith("u1");
        expect(button("Ocultar vídeo")).toBeNull();
    });

    it.each([
        ["our own tile", { isSelf: true }],
        ["a screen", { slot: "screen" as const }],
        ["a person with no camera", { stream: null }],
    ])("does not offer to hide %s", (_name, overrides) => {
        render(tile(overrides), { hideVideo: vi.fn(), showVideo: vi.fn() });

        expect(button("Ocultar vídeo")).toBeNull();
    });

    it("offers nothing without the actions of the stage", () => {
        render(tile());
        expect(button("Ocultar vídeo")).toBeNull();

        render(tile({ stream: null, notice: "user-hidden" }));
        expect(button("Mostrar vídeo")).toBeNull();
    });
});
