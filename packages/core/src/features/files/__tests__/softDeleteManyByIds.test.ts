import { describe, expect, it, vi } from "vitest";

const { returningMock, deleteMock } = vi.hoisted(() => ({
    returningMock: vi.fn(),
    deleteMock: vi.fn(),
}));

vi.mock("@standin/infra", () => ({ StorageProvider: { delete: deleteMock } }));
vi.mock("@standin/database", () => ({
    filesTable: { id: "id", fileName: "file_name", deletedAt: "deleted_at" },
    inArray: vi.fn(),
    isNull: vi.fn(),
    and: vi.fn(),
}));

import { softDeleteFilesByIds } from "../softDeleteManyByIds";

const tx = {
    update: () => ({
        set: () => ({ where: () => ({ returning: returningMock }) }),
    }),
} as never;

describe("softDeleteFilesByIds", () => {
    it("returns the storage keys and leaves storage alone", async () => {
        returningMock.mockResolvedValue([
            { fileName: "k1" },
            { fileName: "k2" },
        ]);

        expect(await softDeleteFilesByIds(["a", "b"], tx)).toEqual([
            "k1",
            "k2",
        ]);
        expect(deleteMock).not.toHaveBeenCalled();
    });

    it("does nothing with no ids", async () => {
        returningMock.mockClear();

        expect(await softDeleteFilesByIds([], tx)).toEqual([]);
        expect(returningMock).not.toHaveBeenCalled();
    });
});
