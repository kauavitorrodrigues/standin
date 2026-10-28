import { beforeEach, describe, expect, it, vi } from "vitest";

const { setThumbnailMock } = vi.hoisted(() => ({
    setThumbnailMock: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    SpaceService: { setThumbnail: setThumbnailMock },
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { setSpaceThumbnail } from "../setThumbnail";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

const params = { organizationId: "org-1", spaceId: "s1" };
const file = { originalname: "photo.png", size: 10 };

describe("setSpaceThumbnail controller", () => {
    beforeEach(() => vi.resetAllMocks());

    it("hands the file to the core and answers the space", async () => {
        const space = { id: "s1", thumbnailUrl: "https://cdn/photo.png" };
        setThumbnailMock.mockResolvedValue(space);
        const res = buildRes();

        await setSpaceThumbnail({ params, file } as any, res);

        expect(setThumbnailMock).toHaveBeenCalledWith("org-1", "s1", file);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ space });
    });

    it("refuses a request without a file and saves nothing", async () => {
        const res = buildRes();

        await setSpaceThumbnail({ params } as any, res);

        expect(setThumbnailMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("refuses an id that is not in the path", async () => {
        const res = buildRes();

        await setSpaceThumbnail(
            { params: { organizationId: "org-1" }, file } as any,
            res
        );

        expect(setThumbnailMock).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("answers 404 for a space that does not exist", async () => {
        setThumbnailMock.mockRejectedValue(new SpaceNotFoundError());
        const res = buildRes();

        await setSpaceThumbnail({ params, file } as any, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
