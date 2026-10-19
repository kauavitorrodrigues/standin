import { beforeEach, describe, expect, it, vi } from "vitest";

const { selectRows, setUserAvatar } = vi.hoisted(() => ({
    selectRows: vi.fn(),
    setUserAvatar: vi.fn(),
}));

vi.mock("@standin/database", () => ({
    avatarPartsTable: {
        id: "id",
        slot: "slot",
        basePartId: "basePartId",
        deletedAt: "deletedAt",
    },
    isNull: vi.fn(),
    db: { select: () => ({ from: () => ({ where: selectRows }) }) },
}));
vi.mock("../setUserAvatar", () => ({ setUserAvatar }));

import { assignRandomAvatar } from "../assignRandomAvatar";

const skinRows = [
    { id: "skin-1", slot: "SKIN", basePartId: null },
    { id: "skin-1-dark", slot: "SKIN", basePartId: "skin-1" },
];

describe("assignRandomAvatar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("saves a random avatar on the default base when there are parts", async () => {
        selectRows.mockResolvedValue(skinRows);

        const assigned = await assignRandomAvatar("u1", () => 0);

        expect(assigned).toBe(true);
        expect(setUserAvatar).toHaveBeenCalledWith("u1", {
            baseId: null,
            parts: [{ slot: "SKIN", partId: "skin-1" }],
        });
    });

    it("picks one of the color variations of the family", async () => {
        selectRows.mockResolvedValue(skinRows);
        const rolls = [0, 0, 0.99];

        await assignRandomAvatar("u1", () => rolls.shift() ?? 0);

        expect(setUserAvatar).toHaveBeenCalledWith("u1", {
            baseId: null,
            parts: [{ slot: "SKIN", partId: "skin-1-dark" }],
        });
    });

    it("skips a family whose base part is deleted", async () => {
        selectRows.mockResolvedValue([
            { id: "skin-1-dark", slot: "SKIN", basePartId: "skin-1" },
        ]);

        expect(await assignRandomAvatar("u1", () => 0)).toBe(false);
        expect(setUserAvatar).not.toHaveBeenCalled();
    });

    it("leaves the user on the default base when there are no parts", async () => {
        selectRows.mockResolvedValue([]);

        expect(await assignRandomAvatar("u1", () => 0)).toBe(false);
        expect(setUserAvatar).not.toHaveBeenCalled();
    });

    it("does not throw when the assembly fails", async () => {
        selectRows.mockResolvedValue(skinRows);
        setUserAvatar.mockRejectedValue(new Error("boom"));

        expect(await assignRandomAvatar("u1", () => 0)).toBe(false);
    });
});
