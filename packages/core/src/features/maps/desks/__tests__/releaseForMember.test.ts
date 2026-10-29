import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateMock, setMock, whereMock, returningMock } = vi.hoisted(() => ({
    updateMock: vi.fn(),
    setMock: vi.fn(),
    whereMock: vi.fn(),
    returningMock: vi.fn(),
}));

vi.mock("@standin/database", () => ({
    db: { update: updateMock, select: vi.fn(() => ({ from: () => ({ where: vi.fn() }) })) },
    deskAssignmentsTable: {
        deletedAt: "deletedAt",
        userId: "userId",
        spaceId: "spaceId",
        mapAssetId: "mapAssetId",
    },
    spacesTable: { id: "id", organizationId: "organizationId" },
    and: vi.fn((...conditions: unknown[]) => ({ and: conditions })),
    eq: vi.fn((column: unknown, value: unknown) => ({ eq: [column, value] })),
    inArray: vi.fn((column: unknown) => ({ inArray: column })),
    isNull: vi.fn((column: unknown) => ({ isNull: column })),
}));

import { releaseMemberDesks } from "../releaseForMember";

beforeEach(() => {
    vi.clearAllMocks();
    updateMock.mockReturnValue({ set: setMock });
    setMock.mockReturnValue({ where: whereMock });
    whereMock.mockReturnValue({ returning: returningMock });
});

describe("releaseMemberDesks", () => {
    it("soft deletes only the active desks of that person and returns them", async () => {
        const freed = [{ spaceId: "s1", mapAssetId: "desk-1", userId: "u1" }];
        returningMock.mockResolvedValue(freed);

        const result = await releaseMemberDesks("u1", "org-1");

        expect(result).toEqual(freed);
        expect(setMock).toHaveBeenCalledWith({ deletedAt: expect.any(Date) });
        const condition = JSON.stringify(whereMock.mock.calls[0][0]);
        expect(condition).toContain('"isNull":"deletedAt"');
        expect(condition).toContain('"eq":["userId","u1"]');
        expect(condition).toContain('"inArray":"spaceId"');
    });

    it("returns nothing when the person held no desk", async () => {
        returningMock.mockResolvedValue([]);
        expect(await releaseMemberDesks("u1", "org-1")).toEqual([]);
    });
});
