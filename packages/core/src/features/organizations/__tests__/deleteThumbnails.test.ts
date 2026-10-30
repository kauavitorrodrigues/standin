import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    transactionMock,
    spaceDeleteMock,
    clipDeleteMock,
    purgeMock,
    publishGuestsMock,
} = vi.hoisted(() => ({
    transactionMock: vi.fn(),
    spaceDeleteMock: vi.fn(),
    clipDeleteMock: vi.fn(),
    purgeMock: vi.fn(),
    publishGuestsMock: vi.fn(),
}));

const returning = (rows: unknown[]) => ({
    set: () => ({ where: () => ({ returning: async () => rows }) }),
});
const tx = { update: vi.fn() };

vi.mock("@standin/database", () => ({
    organizationsTable: {},
    organizationMembersTable: {},
    eq: vi.fn(),
    and: vi.fn(),
    isNull: vi.fn(),
    db: { transaction: transactionMock },
}));
vi.mock("../consts/select", () => ({ organizationSelect: {} }));
vi.mock("../../files", () => ({ FileService: { purge: purgeMock } }));
vi.mock("../../soundboard", () => ({
    SoundboardService: { deleteByOrganizationId: clipDeleteMock },
}));
vi.mock("../../spaces", () => ({
    SpaceService: { deleteByOrganizationId: spaceDeleteMock },
    SpaceGuestService: { publishRemoved: publishGuestsMock },
}));
vi.mock("../members/memberRemovedEvents", () => ({
    publishOrganizationMemberRemoved: vi.fn(),
}));

import { deleteOrganization } from "../delete";

beforeEach(() => {
    vi.resetAllMocks();
    // The organization row, then its members.
    tx.update
        .mockReturnValueOnce(returning([{ id: "org-1" }]))
        .mockReturnValueOnce(returning([{ userId: "u1" }]));
    spaceDeleteMock.mockResolvedValue({
        removedGuests: [],
        storageKeys: ["spaces/s1/thumbnail.png"],
    });
    clipDeleteMock.mockResolvedValue([]);
});

describe("deleteOrganization thumbnails", () => {
    it("removes the photos of its spaces from storage after the commit", async () => {
        const order: string[] = [];
        transactionMock.mockImplementation(async (run) => {
            const result = await run(tx);
            order.push("commit");
            return result;
        });
        purgeMock.mockImplementation(async () => order.push("purge"));

        await deleteOrganization("org-1");

        expect(purgeMock).toHaveBeenCalledWith(["spaces/s1/thumbnail.png"]);
        expect(order).toEqual(["commit", "purge"]);
    });

    it("removes the clips of the organization with its photos", async () => {
        clipDeleteMock.mockResolvedValue(["soundboard/c1.mp3"]);
        transactionMock.mockImplementation((run) => run(tx));

        await deleteOrganization("org-1");

        expect(clipDeleteMock).toHaveBeenCalledWith("org-1", tx);
        expect(purgeMock).toHaveBeenCalledWith([
            "spaces/s1/thumbnail.png",
            "soundboard/c1.mp3",
        ]);
    });

    it("keeps the photos when the deletion rolls back", async () => {
        transactionMock.mockRejectedValue(new Error("db down"));

        await expect(deleteOrganization("org-1")).rejects.toThrow("db down");

        expect(purgeMock).not.toHaveBeenCalled();
    });
});
