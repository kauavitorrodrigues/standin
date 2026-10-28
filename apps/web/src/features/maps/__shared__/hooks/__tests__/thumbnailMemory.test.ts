// @vitest-environment jsdom
import { act, createElement, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublishResult } from "@standin/contracts";

// jsdom has no crypto.subtle: the fingerprint is the size of the blob, which
// is enough to tell the photos of these tests apart.
vi.mock("@/features/maps/__shared__/utils/hashBlob", () => ({
    hashBlob: async (blob: Blob) => String(blob.size),
}));

import { useMissingThumbnail } from "@/features/maps/__shared__/hooks/useMissingThumbnail";
import { usePublishedThumbnail } from "@/features/maps/__shared__/hooks/usePublishedThumbnail";
import { createThumbnailMemory } from "@/features/maps/__shared__/utils/createThumbnailMemory";

type Handler = (result: PublishResult) => void;

const holder: { publish: Handler | null } = { publish: null };
let root: Root;

// The two hooks as the editor wires them: one memory between them.
const Editor = (props: {
    missing: boolean;
    capture: () => Promise<Blob>;
    save: (blob: Blob) => Promise<unknown>;
}) => {
    const [lastSaved] = useState(createThumbnailMemory);
    const thumbnail = { missing: props.missing, save: props.save };
    useMissingThumbnail({
        thumbnail,
        ready: true,
        capture: props.capture,
        lastSaved,
    });
    const publish = usePublishedThumbnail({
        thumbnail,
        capture: props.capture,
        lastSaved,
    });
    useEffect(() => {
        holder.publish = publish;
    });
    return null;
};

const publish = () =>
    act(async () => {
        holder.publish?.({} as PublishResult);
    });

const photoOfSize = (size: number) => new Blob(["x".repeat(size)]);

describe("thumbnail memory shared by the editor hooks", () => {
    let capture: ReturnType<typeof vi.fn<() => Promise<Blob>>>;
    let save: ReturnType<typeof vi.fn<(blob: Blob) => Promise<unknown>>>;

    const open = async (missing: boolean) => {
        await act(async () => {
            root.render(createElement(Editor, { missing, capture, save }));
        });
    };

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.spyOn(console, "warn").mockImplementation(() => {});
        capture = vi.fn();
        save = vi.fn(() => Promise.resolve(undefined));
        root = createRoot(document.createElement("div"));
    });
    afterEach(() => {
        act(() => root.unmount());
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("sends nothing for a publish that left the map looking the same", async () => {
        capture.mockResolvedValue(photoOfSize(5));
        await open(false);

        await publish();
        await publish();

        expect(capture).toHaveBeenCalledTimes(2);
        expect(save).toHaveBeenCalledTimes(1);
    });

    it("sends the photo again once the map looks different", async () => {
        await open(false);
        capture.mockResolvedValueOnce(photoOfSize(5));
        await publish();

        capture.mockResolvedValueOnce(photoOfSize(9));
        await publish();

        expect(save).toHaveBeenCalledTimes(2);
    });

    it("counts the photo made for a missing one, so a first publish with no visible change sends nothing", async () => {
        capture.mockResolvedValue(photoOfSize(5));
        await open(true);
        expect(save).toHaveBeenCalledTimes(1);

        await publish();

        expect(save).toHaveBeenCalledTimes(1);
    });

    it("sends the first publish after a missing photo that did change the map", async () => {
        capture.mockResolvedValueOnce(photoOfSize(5));
        await open(true);

        capture.mockResolvedValueOnce(photoOfSize(7));
        await publish();

        expect(save).toHaveBeenCalledTimes(2);
    });

    it("retries after a save that failed, since nothing was remembered", async () => {
        capture.mockResolvedValue(photoOfSize(5));
        save.mockRejectedValueOnce(new Error("offline"));
        await open(false);

        await publish();
        await publish();

        expect(save).toHaveBeenCalledTimes(2);
    });
});
