import { beforeEach, describe, expect, it, vi } from "vitest";

const { selectMock, returningMock, publishMock } = vi.hoisted(() => ({
    selectMock: vi.fn(),
    returningMock: vi.fn(),
    publishMock: vi.fn(),
}));

vi.mock("../utils/nameEvents", () => ({
    publishUserNameChanged: publishMock,
}));
vi.mock("../consts/select", () => ({ userSelect: {} }));
vi.mock("@standin/database", () => ({
    usersTable: { id: "id", name: "name" },
    eq: vi.fn(),
    db: {
        select: () => ({ from: () => ({ where: selectMock }) }),
        update: () => ({
            set: () => ({ where: () => ({ returning: returningMock }) }),
        }),
    },
}));

import { updateUser } from "../update";

describe("updateUser", () => {
    beforeEach(() => vi.clearAllMocks());

    it("tells the listeners when the name changed", async () => {
        selectMock.mockResolvedValue([{ name: "Ana" }]);
        returningMock.mockResolvedValue([{ id: "u1", name: "Ana Souza" }]);

        const user = await updateUser("u1", { name: "Ana Souza" });

        expect(user).toEqual({ id: "u1", name: "Ana Souza" });
        expect(publishMock).toHaveBeenCalledWith({
            userId: "u1",
            name: "Ana Souza",
        });
    });

    it("tells nobody when the name is the same", async () => {
        selectMock.mockResolvedValue([{ name: "Ana" }]);
        returningMock.mockResolvedValue([{ id: "u1", name: "Ana" }]);

        await updateUser("u1", { name: "Ana" });

        expect(publishMock).not.toHaveBeenCalled();
    });
});
