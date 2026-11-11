import { beforeEach, describe, expect, it, vi } from "vitest";
import { MapAssetNotFoundError } from "@standin/contracts";

const resolveWebsiteUrl = vi.hoisted(() => vi.fn());
vi.mock("@standin/core", () => ({ MapService: { resolveWebsiteUrl } }));

import { getWebsitePreview } from "../getWebsitePreview";

const PREVIEW = {
    title: "Board",
    faviconDataUrl: "data:image/png;base64,AA==",
};
const EMPTY = { title: null, faviconDataUrl: null };

describe("getWebsitePreview", () => {
    beforeEach(() => {
        resolveWebsiteUrl.mockReset();
    });

    it("loads the address that is stored for the object", async () => {
        resolveWebsiteUrl.mockResolvedValue("https://one.example.com/");
        const load = vi.fn().mockResolvedValue(PREVIEW);

        const preview = await getWebsitePreview("map", "object", load);

        expect(resolveWebsiteUrl).toHaveBeenCalledWith("map", "object");
        expect(load).toHaveBeenCalledWith("https://one.example.com/");
        expect(preview).toEqual(PREVIEW);
    });

    it("answers from the cache the second time", async () => {
        resolveWebsiteUrl.mockResolvedValue("https://two.example.com/");
        const load = vi.fn().mockResolvedValue(PREVIEW);

        await getWebsitePreview("map", "a", load);
        await getWebsitePreview("map", "b", load);

        expect(load).toHaveBeenCalledTimes(1);
    });

    it("makes one request for people who ask at the same time", async () => {
        resolveWebsiteUrl.mockResolvedValue("https://three.example.com/");
        const load = vi.fn().mockResolvedValue(PREVIEW);

        await Promise.all([
            getWebsitePreview("map", "a", load),
            getWebsitePreview("map", "a", load),
            getWebsitePreview("map", "a", load),
        ]);

        expect(load).toHaveBeenCalledTimes(1);
    });

    it("does not load anything for an address that is no longer valid", async () => {
        resolveWebsiteUrl.mockResolvedValue(null);
        const load = vi.fn();

        const preview = await getWebsitePreview("map", "object", load);

        expect(preview).toEqual(EMPTY);
        expect(load).not.toHaveBeenCalled();
    });

    it("remembers an empty answer too, so a dead site is not asked again at once", async () => {
        resolveWebsiteUrl.mockResolvedValue("https://four.example.com/");
        const load = vi.fn().mockResolvedValue(EMPTY);

        await getWebsitePreview("map", "a", load);
        await getWebsitePreview("map", "a", load);

        expect(load).toHaveBeenCalledTimes(1);
    });

    it("passes on a missing object", async () => {
        resolveWebsiteUrl.mockRejectedValue(new MapAssetNotFoundError());

        await expect(
            getWebsitePreview("map", "gone", vi.fn())
        ).rejects.toBeInstanceOf(MapAssetNotFoundError);
    });
});
