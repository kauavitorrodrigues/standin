import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    returningMock,
    transactionMock,
    softDeleteMock,
    purgeMock,
    conversationsMock,
    mapsMock,
    guestsMock,
    publishMock,
} = vi.hoisted(() => ({
    returningMock: vi.fn(),
    transactionMock: vi.fn(),
    softDeleteMock: vi.fn(),
    purgeMock: vi.fn(),
    conversationsMock: vi.fn(),
    mapsMock: vi.fn(),
    guestsMock: vi.fn(),
    publishMock: vi.fn(),
}));

const tx = {
    update: () => ({
        set: () => ({ where: () => ({ returning: returningMock }) }),
    }),
};

vi.mock("@standin/database", () => ({
    spacesTable: {
        id: "id",
        mapId: "map_id",
        organizationId: "organization_id",
        deletedAt: "deleted_at",
        thumbnailFileId: "thumbnail_file_id",
    },
    filesTable: { fileName: "file_name" },
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
    db: { transaction: transactionMock },
}));
vi.mock("@standin/infra", () => ({
    StorageProvider: {
        getUrl: vi.fn(async (name: string) => `https://cdn/${name}`),
    },
}));
vi.mock("../../files", () => ({
    FileService: { softDeleteManyByIds: softDeleteMock, purge: purgeMock },
}));
vi.mock("../../conversations", () => ({
    ConversationService: { deleteBySpaceIds: conversationsMock },
}));
vi.mock("../../maps", () => ({ MapService: { deleteByIds: mapsMock } }));
vi.mock("../guests/deleteBySpaceIds", () => ({
    deleteSpaceGuestsBySpaceIds: guestsMock,
    publishGuestsRemoved: publishMock,
}));

import { SpaceNotFoundError } from "@standin/contracts";
import { deleteSpace } from "../delete";
import { deleteSpacesByOrganizationId } from "../deleteByOrganizationId";

const space = {
    id: "s1",
    name: "Lobby",
    organizationId: "org-1",
    mapId: "map-1",
    guestAccess: "ALLOWED",
    createdAt: new Date("2026-10-28T10:00:00.000Z"),
    thumbnailFileId: null as string | null,
};

beforeEach(() => {
    vi.resetAllMocks();
    transactionMock.mockImplementation(async (run) => run(tx));
    guestsMock.mockResolvedValue([]);
    softDeleteMock.mockResolvedValue([]);
});

describe("deleteSpace", () => {
    it("soft deletes the file of the thumbnail inside the same transaction", async () => {
        returningMock.mockResolvedValue([{ ...space, thumbnailFileId: "f1" }]);

        await deleteSpace("org-1", "s1");

        expect(softDeleteMock).toHaveBeenCalledWith(["f1"], tx);
    });

    it("removes the object from storage only after the commit", async () => {
        returningMock.mockResolvedValue([{ ...space, thumbnailFileId: "f1" }]);
        softDeleteMock.mockResolvedValue(["spaces/s1/thumbnail.png"]);
        const order: string[] = [];
        transactionMock.mockImplementation(async (run) => {
            const result = await run(tx);
            order.push("commit");
            return result;
        });
        purgeMock.mockImplementation(async () => order.push("purge"));

        await deleteSpace("org-1", "s1");

        expect(purgeMock).toHaveBeenCalledWith(["spaces/s1/thumbnail.png"]);
        expect(order).toEqual(["commit", "purge"]);
    });

    it("keeps the object when the transaction rolls back", async () => {
        returningMock.mockResolvedValue([{ ...space, thumbnailFileId: "f1" }]);
        conversationsMock.mockRejectedValue(new Error("db down"));

        await expect(deleteSpace("org-1", "s1")).rejects.toThrow("db down");

        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("has no file to remove for a space without thumbnail", async () => {
        returningMock.mockResolvedValue([space]);

        await deleteSpace("org-1", "s1");

        expect(softDeleteMock).toHaveBeenCalledWith([], tx);
        expect(purgeMock).toHaveBeenCalledWith([]);
    });

    it("answers with a null thumbnail, the file went with the space", async () => {
        returningMock.mockResolvedValue([{ ...space, thumbnailFileId: "f1" }]);

        const deleted = await deleteSpace("org-1", "s1");

        expect(deleted.thumbnailUrl).toBeNull();
        expect(deleted).not.toHaveProperty("thumbnailFileId");
    });

    it("touches no file when the space does not exist", async () => {
        returningMock.mockResolvedValue([]);

        await expect(deleteSpace("org-1", "s1")).rejects.toBeInstanceOf(
            SpaceNotFoundError
        );
        expect(softDeleteMock).not.toHaveBeenCalled();
        expect(purgeMock).not.toHaveBeenCalled();
    });
});

describe("deleteSpacesByOrganizationId", () => {
    it("soft deletes the files of every thumbnail and skips the spaces without one", async () => {
        returningMock.mockResolvedValue([
            { id: "s1", mapId: "m1", thumbnailFileId: "f1" },
            { id: "s2", mapId: "m2", thumbnailFileId: null },
            { id: "s3", mapId: "m3", thumbnailFileId: "f3" },
        ]);

        await deleteSpacesByOrganizationId("org-1", tx as never);

        expect(softDeleteMock).toHaveBeenCalledWith(["f1", "f3"], tx);
    });

    it("hands the storage keys to the caller instead of purging them itself", async () => {
        returningMock.mockResolvedValue([
            { id: "s1", mapId: "m1", thumbnailFileId: "f1" },
        ]);
        softDeleteMock.mockResolvedValue(["spaces/s1/thumbnail.png"]);
        guestsMock.mockResolvedValue([{ spaceId: "s1", userId: "u1" }]);

        const result = await deleteSpacesByOrganizationId("org-1", tx as never);

        expect(result).toEqual({
            removedGuests: [{ spaceId: "s1", userId: "u1" }],
            storageKeys: ["spaces/s1/thumbnail.png"],
        });
        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("asks to remove no file when the organization has no space", async () => {
        returningMock.mockResolvedValue([]);

        const result = await deleteSpacesByOrganizationId("org-1", tx as never);

        expect(softDeleteMock).toHaveBeenCalledWith([], tx);
        expect(result.storageKeys).toEqual([]);
    });
});
