import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUrlMock, fileMock } = vi.hoisted(() => ({
    getUrlMock: vi.fn(),
    fileMock: vi.fn(),
}));

vi.mock("@standin/infra", () => ({ StorageProvider: { getUrl: getUrlMock } }));
vi.mock("@standin/database", () => ({
    filesTable: { id: "id", fileName: "file_name" },
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
    db: { select: () => ({ from: () => ({ where: fileMock }) }) },
}));

import { serializeSpace } from "../utils/serializeSpace";
import {
    serializeReturnedSpace,
    serializeSpaceWithoutThumbnail,
} from "../utils/serializeReturnedSpace";

const row = {
    id: "s1",
    name: "Lobby",
    organizationId: "org-1",
    mapId: "map-1",
    guestAccess: "ALLOWED" as const,
    createdAt: new Date("2026-10-28T10:00:00.000Z"),
};

beforeEach(() => {
    vi.clearAllMocks();
    getUrlMock.mockImplementation(
        async (name: string) => `https://cdn/${name}`
    );
});

describe("serializeSpace", () => {
    it("gives a null thumbnail to a space without a file", async () => {
        const space = await serializeSpace({ ...row, thumbnailFileName: null });

        expect(space.thumbnailUrl).toBeNull();
        expect(getUrlMock).not.toHaveBeenCalled();
    });

    it("resolves the url of the file of the thumbnail", async () => {
        const space = await serializeSpace({
            ...row,
            thumbnailFileName: "spaces/s1/photo.png",
        });

        expect(space.thumbnailUrl).toBe("https://cdn/spaces/s1/photo.png");
    });

    it("sends the date as an ISO string and never leaks the file name", async () => {
        const space = await serializeSpace({
            ...row,
            thumbnailFileName: "spaces/s1/photo.png",
        });

        expect(space.createdAt).toBe("2026-10-28T10:00:00.000Z");
        expect(space).not.toHaveProperty("thumbnailFileName");
    });
});

describe("serializeReturnedSpace", () => {
    it("does not query the file of a space without thumbnail", async () => {
        const space = await serializeReturnedSpace({
            ...row,
            thumbnailFileId: null,
        });

        expect(space.thumbnailUrl).toBeNull();
        expect(fileMock).not.toHaveBeenCalled();
    });

    it("looks up the file name by its id", async () => {
        fileMock.mockResolvedValue([{ fileName: "spaces/s1/photo.png" }]);

        const space = await serializeReturnedSpace({
            ...row,
            thumbnailFileId: "f1",
        });

        expect(space.thumbnailUrl).toBe("https://cdn/spaces/s1/photo.png");
        expect(space).not.toHaveProperty("thumbnailFileId");
    });

    it("falls back to null when the file is gone", async () => {
        fileMock.mockResolvedValue([]);

        const space = await serializeReturnedSpace({
            ...row,
            thumbnailFileId: "f1",
        });

        expect(space.thumbnailUrl).toBeNull();
    });
});

describe("serializeSpaceWithoutThumbnail", () => {
    it("ignores the file id, since the file was removed or never existed", async () => {
        const space = await serializeSpaceWithoutThumbnail({
            ...row,
            thumbnailFileId: "f1",
        });

        expect(space.thumbnailUrl).toBeNull();
        expect(space).not.toHaveProperty("thumbnailFileId");
        expect(fileMock).not.toHaveBeenCalled();
    });
});
