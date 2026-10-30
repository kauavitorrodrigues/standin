import { afterEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { SpaceSoundboard } from "../../../types/space";
import { SoundboardControl } from "../SoundboardControl";

const soundboard: SpaceSoundboard = {
    disabledReason: null,
    isAtLimit: false,
    playingClipIds: new Set<string>(),
    play: vi.fn(() => Promise.resolve()),
};

let root: Root | null = null;
let container: HTMLDivElement | null = null;

const render = (props: {
    soundboard: SpaceSoundboard | null;
    isOpen: boolean;
}) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const onToggle = vi.fn();
    const host = document.createElement("div");
    document.body.append(host);
    const mounted = createRoot(host);
    container = host;
    root = mounted;
    act(() =>
        mounted.render(
            createElement(TooltipProvider, {
                children: createElement(SoundboardControl, {
                    ...props,
                    onToggle,
                }),
            })
        )
    );
    return { button: host.querySelector("button"), onToggle };
};

describe("SoundboardControl", () => {
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        root = null;
        container = null;
    });

    it("is not pressed while the row is closed", () => {
        const { button } = render({ soundboard, isOpen: false });

        expect(button?.getAttribute("aria-pressed")).toBe("false");
    });

    it("is pressed while the row is open", () => {
        const { button } = render({ soundboard, isOpen: true });

        expect(button?.getAttribute("aria-pressed")).toBe("true");
    });

    it("toggles the row on click", () => {
        const { button, onToggle } = render({ soundboard, isOpen: false });

        act(() => button?.click());

        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("toggles the row with the B key", () => {
        const { onToggle } = render({ soundboard, isOpen: false });

        act(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
        });

        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("renders nothing and ignores the key where clips cannot be played", () => {
        const { button, onToggle } = render({
            soundboard: null,
            isOpen: false,
        });

        act(() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
        });

        expect(button).toBeNull();
        expect(onToggle).not.toHaveBeenCalled();
    });
});
