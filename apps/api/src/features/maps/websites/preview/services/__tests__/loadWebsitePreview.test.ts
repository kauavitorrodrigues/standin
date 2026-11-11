import { describe, expect, it, vi } from "vitest";
import { WebsitePreviewTimeoutError } from "@standin/contracts";
import type { FetchedResource, FetchResource, FrameHeaders } from "../../types";
import { loadWebsitePreview } from "../loadWebsitePreview";

const OPEN: FrameHeaders = {
    xFrameOptions: null,
    contentSecurityPolicy: null,
};
const ORIGINS = ["https://standin.example"];

const page = (
    html: string,
    finalUrl = "https://example.com/board",
    frameHeaders: FrameHeaders = OPEN
) =>
    ({
        finalUrl,
        contentType: "text/html",
        body: Buffer.from(html),
        frameHeaders,
    }) satisfies FetchedResource;
const icon = (bytes: number[], contentType = "image/png") =>
    ({
        finalUrl: "https://example.com/icon.png",
        contentType,
        body: Buffer.from(bytes),
        frameHeaders: OPEN,
    }) satisfies FetchedResource;

describe("loadWebsitePreview", () => {
    it("gives the title and the icon as a data address", async () => {
        const fetchResource = vi.fn<FetchResource>(async (url) =>
            url === "https://example.com/board"
                ? page(
                      '<title>Whiteboard</title><link rel="icon" href="/icon.png">'
                  )
                : icon([1, 2, 3])
        );

        const preview = await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(preview).toEqual({
            title: "Whiteboard",
            faviconDataUrl: "data:image/png;base64,AQID",
            canEmbed: true,
        });
        expect(fetchResource).toHaveBeenCalledWith(
            "https://example.com/icon.png",
            expect.objectContaining({ overflow: "reject" })
        );
    });

    it("asks for the favicon of the site when the page declares none", async () => {
        const fetchResource = vi.fn<FetchResource>(async (url) =>
            url === "https://example.com/board"
                ? page("<title>Plain</title>")
                : icon([9])
        );

        const preview = await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(fetchResource).toHaveBeenLastCalledWith(
            "https://example.com/favicon.ico",
            expect.anything()
        );
        expect(preview.faviconDataUrl).toBe("data:image/png;base64,CQ==");
    });

    it("follows the page it was redirected to for the icon", async () => {
        const fetchResource = vi.fn<FetchResource>(async (url) =>
            url === "https://example.com/board"
                ? page("<title>Moved</title>", "https://app.example.net/b/")
                : icon([1])
        );

        await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(fetchResource).toHaveBeenLastCalledWith(
            "https://app.example.net/favicon.ico",
            expect.anything()
        );
    });

    it("keeps the title when the icon cannot be read", async () => {
        const fetchResource = vi.fn<FetchResource>(async (url) => {
            if (url === "https://example.com/board") {
                return page("<title>Only title</title>");
            }
            throw new WebsitePreviewTimeoutError();
        });

        const preview = await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(preview).toEqual({
            title: "Only title",
            faviconDataUrl: null,
            canEmbed: true,
        });
    });

    it("never fails: an unreadable page gives an empty preview", async () => {
        const fetchResource = vi.fn<FetchResource>(async () => {
            throw new WebsitePreviewTimeoutError();
        });

        const preview = await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(preview).toEqual({
            title: null,
            faviconDataUrl: null,
            canEmbed: true,
        });
        expect(fetchResource).toHaveBeenCalledTimes(1);
    });

    it("ignores an empty icon", async () => {
        const fetchResource = vi.fn<FetchResource>(async (url) =>
            url === "https://example.com/board"
                ? page("<title>T</title>")
                : icon([])
        );

        const preview = await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(preview.faviconDataUrl).toBeNull();
    });

    it("says the site refuses a frame when its headers do", async () => {
        const fetchResource = vi.fn<FetchResource>(async () =>
            page("<title>Closed</title>", "https://example.com/board", {
                xFrameOptions: "DENY",
                contentSecurityPolicy: null,
            })
        );

        const preview = await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(preview.canEmbed).toBe(false);
    });

    it("says the site accepts a frame from the app by frame-ancestors", async () => {
        const fetchResource = vi.fn<FetchResource>(async () =>
            page("<title>Open</title>", "https://example.com/board", {
                xFrameOptions: null,
                contentSecurityPolicy:
                    "frame-ancestors https://standin.example",
            })
        );

        const preview = await loadWebsitePreview(
            "https://example.com/board",
            ORIGINS,
            fetchResource
        );

        expect(preview.canEmbed).toBe(true);
    });
});
