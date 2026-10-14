// @vitest-environment jsdom
import { StrictMode, act, createElement } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMissingThumbnail } from "@/features/maps/__shared__/hooks/useMissingThumbnail";
import type { EditorThumbnailTarget } from "@/features/maps/__shared__/types/thumbnail";

type ProbeProps = {
    thumbnail: EditorThumbnailTarget | undefined;
    ready: boolean;
    capture: () => Promise<Blob>;
};

const Probe = (props: ProbeProps) => {
    useMissingThumbnail(props);
    return null;
};

let root: Root;

const render = (props: ProbeProps, strict = false) => {
    const element = createElement(Probe, props);
    act(() => {
        root.render(
            strict ? createElement(StrictMode, null, element) : element
        );
    });
};

const flush = () => act(async () => {});

describe("useMissingThumbnail", () => {
    const blob = new Blob(["png"]);
    let capture: ReturnType<typeof vi.fn<() => Promise<Blob>>>;
    let save: ReturnType<typeof vi.fn<(blob: Blob) => Promise<unknown>>>;

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        capture = vi.fn(() => Promise.resolve(blob));
        save = vi.fn(() => Promise.resolve(undefined));
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
    });

    it("captures and saves once when ready and missing", async () => {
        const props = {
            thumbnail: { missing: true, save },
            ready: true,
            capture,
        };
        render(props);
        await flush();
        render({ ...props, thumbnail: { missing: true, save } });
        await flush();

        expect(capture).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith(blob);
    });

    it("does not repeat under StrictMode", async () => {
        render(
            { thumbnail: { missing: true, save }, ready: true, capture },
            true
        );
        await flush();

        expect(capture).toHaveBeenCalledTimes(1);
    });

    it("waits for the scene to be ready", async () => {
        const thumbnail = { missing: true, save };
        render({ thumbnail, ready: false, capture });
        await flush();
        expect(capture).not.toHaveBeenCalled();

        render({ thumbnail, ready: true, capture });
        await flush();
        expect(capture).toHaveBeenCalledTimes(1);
    });

    it("does nothing when the photo is not missing or there is no target", async () => {
        render({ thumbnail: { missing: false, save }, ready: true, capture });
        await flush();
        render({ thumbnail: undefined, ready: true, capture });
        await flush();

        expect(capture).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
    });

    it("does not propagate a failed save and does not retry", async () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        save.mockRejectedValue(new Error("fail"));
        const props = {
            thumbnail: { missing: true, save },
            ready: true,
            capture,
        };

        render(props);
        await flush();
        render({ ...props, thumbnail: { missing: true, save } });
        await flush();

        expect(save).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
