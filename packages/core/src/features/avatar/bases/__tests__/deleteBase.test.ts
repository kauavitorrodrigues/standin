import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    AvatarBaseDefaultDeleteError,
    AvatarBaseNotFoundError,
} from "@standin/contracts";
import { deleteBase } from "../deleteBase";

const { findActiveBaseRow, update } = vi.hoisted(() => ({
    findActiveBaseRow: vi.fn(),
    update: vi.fn(),
}));

vi.mock("../utils/findBaseRow", () => ({ findActiveBaseRow }));
vi.mock("@standin/database", () => ({
    avatarBasesTable: { id: "id", deletedAt: "deleted_at" },
    eq: vi.fn(),
    db: {
        update: () => ({
            set: (values: unknown) => ({
                where: () => update(values),
            }),
        }),
    },
}));

describe("deleteBase", () => {
    beforeEach(() => vi.clearAllMocks());

    it("refuses to delete the default base", async () => {
        findActiveBaseRow.mockResolvedValue({ id: "b1", isDefault: true });

        await expect(deleteBase("b1")).rejects.toBeInstanceOf(
            AvatarBaseDefaultDeleteError
        );
        expect(update).not.toHaveBeenCalled();
    });

    it("soft deletes a base that is not the default", async () => {
        findActiveBaseRow.mockResolvedValue({ id: "b2", isDefault: false });

        await deleteBase("b2");

        expect(update).toHaveBeenCalledWith({ deletedAt: expect.any(Date) });
    });

    it("passes the not found error through", async () => {
        findActiveBaseRow.mockRejectedValue(new AvatarBaseNotFoundError());

        await expect(deleteBase("missing")).rejects.toBeInstanceOf(
            AvatarBaseNotFoundError
        );
    });
});
