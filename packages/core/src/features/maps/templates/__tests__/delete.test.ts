import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    statusMock,
    returningMock,
    transactionMock,
    deleteMapsMock,
    softDeleteMock,
    purgeMock,
} = vi.hoisted(() => ({
    statusMock: vi.fn(),
    returningMock: vi.fn(),
    transactionMock: vi.fn(),
    deleteMapsMock: vi.fn(),
    softDeleteMock: vi.fn(),
    purgeMock: vi.fn(),
}));

const tx = {
    select: () => ({
        from: () => ({ where: () => ({ for: statusMock }) }),
    }),
    update: () => ({
        set: () => ({ where: () => ({ returning: returningMock }) }),
    }),
};

vi.mock("@standin/database", () => ({
    mapTemplatesTable: { id: "id", deletedAt: "deleted_at" },
    mapsTable: {},
    filesTable: {},
    and: vi.fn(),
    eq: vi.fn(),
    isNull: vi.fn(),
    db: { transaction: transactionMock },
}));
vi.mock("../../deleteByIds", () => ({ deleteMapsByIds: deleteMapsMock }));
vi.mock("../../../files", () => ({
    FileService: { softDeleteManyByIds: softDeleteMock, purge: purgeMock },
}));

import {
    MapTemplateNotDeletableError,
    MapTemplateNotFoundError,
} from "@standin/contracts";
import { deleteTemplate } from "../delete";

beforeEach(() => {
    vi.resetAllMocks();
    transactionMock.mockImplementation(async (run) => run(tx));
    statusMock.mockResolvedValue([{ status: "DRAFT" }]);
    returningMock.mockResolvedValue([{ mapId: "m1", thumbnailFileId: "f1" }]);
    softDeleteMock.mockResolvedValue(["templates/t1/thumbnail.png"]);
});

describe("deleteTemplate", () => {
    it("soft deletes the file of the thumbnail inside the same transaction", async () => {
        await deleteTemplate("t1");

        expect(softDeleteMock).toHaveBeenCalledWith(["f1"], tx);
    });

    it("removes the object from storage only after the commit", async () => {
        const order: string[] = [];
        transactionMock.mockImplementation(async (run) => {
            const result = await run(tx);
            order.push("commit");
            return result;
        });
        purgeMock.mockImplementation(async () => order.push("purge"));

        await deleteTemplate("t1");

        expect(purgeMock).toHaveBeenCalledWith(["templates/t1/thumbnail.png"]);
        expect(order).toEqual(["commit", "purge"]);
    });

    it("keeps the object when the transaction rolls back", async () => {
        deleteMapsMock.mockRejectedValue(new Error("db down"));

        await expect(deleteTemplate("t1")).rejects.toThrow("db down");

        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("has no file to remove for a template without a photo", async () => {
        returningMock.mockResolvedValue([
            { mapId: "m1", thumbnailFileId: null },
        ]);
        softDeleteMock.mockResolvedValue([]);

        await deleteTemplate("t1");

        expect(softDeleteMock).toHaveBeenCalledWith([], tx);
    });

    it("refuses a published template and touches no file", async () => {
        statusMock.mockResolvedValue([{ status: "PUBLISHED" }]);

        await expect(deleteTemplate("t1")).rejects.toBeInstanceOf(
            MapTemplateNotDeletableError
        );
        expect(softDeleteMock).not.toHaveBeenCalled();
        expect(purgeMock).not.toHaveBeenCalled();
    });

    it("touches no file for a template that does not exist", async () => {
        statusMock.mockResolvedValue([]);

        await expect(deleteTemplate("t1")).rejects.toBeInstanceOf(
            MapTemplateNotFoundError
        );
        expect(purgeMock).not.toHaveBeenCalled();
    });
});
