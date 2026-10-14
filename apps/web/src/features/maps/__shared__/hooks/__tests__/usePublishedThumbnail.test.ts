// @vitest-environment jsdom
import { act, createElement, useEffect } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublishResult } from "@standin/contracts";
import { usePublishedThumbnail } from "@/features/maps/__shared__/hooks/usePublishedThumbnail";
import type { EditorThumbnailTarget } from "@/features/maps/__shared__/types/thumbnail";

type Handler = (result: PublishResult) => void;

let root: Root;
const holder: { handler: Handler | null } = { handler: null };

const result = {} as PublishResult;

const Probe = (props: {
    thumbnail: EditorThumbnailTarget | undefined;
    capture: () => Promise<Blob>;
    onPublished?: Handler;
}) => {
    const handler = usePublishedThumbnail(props);
    useEffect(() => {
        holder.handler = handler;
    });
    return null;
};

const render = (props: Parameters<typeof Probe>[0]) => {
    act(() => root.render(createElement(Probe, props)));
};

const publish = () =>
    act(async () => {
        holder.handler?.(result);
    });

describe("usePublishedThumbnail", () => {
    const blob = new Blob(["png"]);
    let capture: ReturnType<typeof vi.fn<() => Promise<Blob>>>;
    let save: ReturnType<typeof vi.fn<(blob: Blob) => Promise<unknown>>>;

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.spyOn(console, "warn").mockImplementation(() => {});
        capture = vi.fn(() => Promise.resolve(blob));
        save = vi.fn(() => Promise.resolve(undefined));
        root = createRoot(document.createElement("div"));
    });

    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("captures and saves once per successful publish, even when not missing", async () => {
        render({ thumbnail: { missing: false, save }, capture });
        await publish();
        expect(capture).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith(blob);
    });

    it("does nothing without a thumbnail target, but still calls onPublished", async () => {
        const onPublished = vi.fn();
        render({ thumbnail: undefined, capture, onPublished });
        await publish();
        expect(capture).not.toHaveBeenCalled();
        expect(onPublished).toHaveBeenCalledWith(result);
    });

    it("does not capture until the handler is called (failed publish)", async () => {
        render({ thumbnail: { missing: true, save }, capture });
        await act(async () => {});
        expect(capture).not.toHaveBeenCalled();
        expect(save).not.toHaveBeenCalled();
    });

    it("does not throw when the save fails", async () => {
        save.mockRejectedValue(new Error("boom"));
        const onPublished = vi.fn();
        render({ thumbnail: { missing: false, save }, capture, onPublished });
        await expect(publish()).resolves.toBeUndefined();
        expect(onPublished).toHaveBeenCalledTimes(1);
    });

    it("does not throw when the capture fails", async () => {
        capture.mockRejectedValue(new Error("boom"));
        render({ thumbnail: { missing: false, save }, capture });
        await expect(publish()).resolves.toBeUndefined();
        expect(save).not.toHaveBeenCalled();
    });
});
