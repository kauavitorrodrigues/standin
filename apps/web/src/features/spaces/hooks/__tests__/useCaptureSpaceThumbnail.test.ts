// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TEMPLATE_PREVIEW_QUERY_KEY } from "@/features/maps/templates/queries/usePreview";
import { BLANK_PREVIEW_QUERY_KEY } from "@/features/maps/templates/queries/useBlankPreview";

const { captureMock, setThumbnailMock, getMock } = vi.hoisted(() => ({
    captureMock: vi.fn(),
    setThumbnailMock: vi.fn(),
    getMock: vi.fn(),
}));

vi.mock("@/lib/axios/api", () => ({ api: { get: getMock } }));
vi.mock("@/features/game/preview/captureMapPreview", () => ({
    captureMapPreview: captureMock,
}));
vi.mock("../../mutations", () => ({
    SpaceMutations: {
        setThumbnail: () => ({ mutateAsync: setThumbnailMock }),
    },
}));

import { useCaptureSpaceThumbnail } from "../useCaptureSpaceThumbnail";

const preview = {
    map: { id: "m1", width: 10, height: 8, tileSize: 32, layout: {} },
    tilesets: [{ name: "floor", url: "https://cdn/floor.png" }],
    assets: [],
    placed: [],
};

describe("useCaptureSpaceThumbnail", () => {
    const photo = new Blob(["png"], { type: "image/png" });
    let queryClient: QueryClient;
    let capture: ReturnType<typeof useCaptureSpaceThumbnail>;

    beforeEach(() => {
        vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.clearAllMocks();
        captureMock.mockResolvedValue(photo);
        setThumbnailMock.mockResolvedValue({ id: "s1" });
        getMock.mockResolvedValue({ data: { preview } });
        queryClient = new QueryClient();

        const Probe = () => {
            capture = useCaptureSpaceThumbnail();
            return null;
        };
        const root = createRoot(document.createElement("div"));
        act(() =>
            root.render(
                createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    createElement(Probe)
                )
            )
        );
    });
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("draws the template the space was made from and saves the photo into it", async () => {
        await capture({ spaceId: "s1", templateId: "t1", tier: "XS" });

        expect(getMock).toHaveBeenCalledWith("/templates/t1/preview");
        expect(captureMock).toHaveBeenCalledTimes(1);
        expect(captureMock.mock.calls[0][0]).toMatchObject({
            id: "m1",
            tilesets: [{ tilesetName: "floor", url: "https://cdn/floor.png" }],
        });
        expect(setThumbnailMock).toHaveBeenCalledWith({
            spaceId: "s1",
            thumbnail: photo,
        });
    });

    it("draws the blank map of the tier when no template was chosen", async () => {
        await capture({ spaceId: "s1", templateId: undefined, tier: "XS" });

        expect(getMock).toHaveBeenCalledWith("/templates/blank/XS/preview");
        expect(setThumbnailMock).toHaveBeenCalledTimes(1);
    });

    it("uses the preview the creation page already loaded, with no new request", async () => {
        queryClient.setQueryData([TEMPLATE_PREVIEW_QUERY_KEY, "t1"], preview);
        queryClient.setQueryData([BLANK_PREVIEW_QUERY_KEY, "XS"], preview);

        await capture({ spaceId: "s1", templateId: "t1", tier: "XS" });
        await capture({ spaceId: "s2", templateId: undefined, tier: "XS" });

        expect(getMock).not.toHaveBeenCalled();
        expect(setThumbnailMock).toHaveBeenCalledTimes(2);
    });

    it("never throws when the map cannot be drawn, and saves nothing", async () => {
        captureMock.mockRejectedValue(new Error("canvas gone"));

        await expect(
            capture({ spaceId: "s1", templateId: "t1", tier: "XS" })
        ).resolves.toBeUndefined();
        expect(setThumbnailMock).not.toHaveBeenCalled();
    });

    it("never throws when the preview cannot be fetched", async () => {
        getMock.mockRejectedValue(new Error("offline"));

        await expect(
            capture({ spaceId: "s1", templateId: "t1", tier: "XS" })
        ).resolves.toBeUndefined();
        expect(captureMock).not.toHaveBeenCalled();
        expect(setThumbnailMock).not.toHaveBeenCalled();
    });

    it("never throws when the upload fails", async () => {
        setThumbnailMock.mockRejectedValue(new Error("403"));

        await expect(
            capture({ spaceId: "s1", templateId: "t1", tier: "XS" })
        ).resolves.toBeUndefined();
    });
});
