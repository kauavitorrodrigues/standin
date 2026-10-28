import { beforeEach, describe, expect, it, vi } from "vitest";

const { findByIdMock, resolveFileDeliveryMock } = vi.hoisted(() => ({
    findByIdMock: vi.fn(),
    resolveFileDeliveryMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({ FileService: { findById: findByIdMock } }));
vi.mock("@standin/infra", () => ({
    resolveFileDelivery: resolveFileDeliveryMock,
}));

import { serveFile } from "../serve";

const ID = "0190a0a0-0000-7000-8000-000000000001";

const buildRes = () => {
    const res = {
        set: vi.fn(),
        type: vi.fn(),
        redirect: vi.fn(),
        sendFile: vi.fn(),
    };
    res.set.mockReturnValue(res);
    res.type.mockReturnValue(res);
    return res;
};

const run = async () => {
    const res = buildRes();
    await serveFile({ params: { id: ID } } as never, res as never);
    return res;
};

beforeEach(() => {
    vi.clearAllMocks();
    findByIdMock.mockResolvedValue({
        fileName: "a/b.png",
        mimeType: "image/png",
    });
});

describe("serveFile", () => {
    it("redirects to the bucket with a short cache, never the immutable one", async () => {
        resolveFileDeliveryMock.mockResolvedValue({
            kind: "redirect",
            url: "https://files.example.com/a/b.png",
        });

        const res = await run();

        expect(res.redirect).toHaveBeenCalledWith(
            "https://files.example.com/a/b.png"
        );
        expect(res.set).toHaveBeenCalledWith(
            "Cache-Control",
            "public, max-age=3600"
        );
        expect(res.set).not.toHaveBeenCalledWith(
            "Cache-Control",
            expect.stringContaining("immutable")
        );
    });

    it("sends a local file with the immutable cache", async () => {
        resolveFileDeliveryMock.mockResolvedValue({
            kind: "local-file",
            absolutePath: "/srv/public/a/b.png",
        });

        const res = await run();

        expect(res.set).toHaveBeenCalledWith(
            "Cache-Control",
            "public, max-age=31536000, immutable"
        );
        expect(res.type).toHaveBeenCalledWith("image/png");
        expect(res.sendFile).toHaveBeenCalledWith("/srv/public/a/b.png");
    });
});
