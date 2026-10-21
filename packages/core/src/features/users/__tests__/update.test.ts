import { beforeEach, describe, expect, it, vi } from "vitest";

const { selectMock, readUserMock, publishMock } = vi.hoisted(() => ({
    selectMock: vi.fn(),
    readUserMock: vi.fn(),
    publishMock: vi.fn(),
}));

vi.mock("../utils/nameEvents", () => ({
    publishUserNameChanged: publishMock,
}));
vi.mock("../utils/readUser", () => ({ readUser: readUserMock }));
vi.mock("@standin/database", () => ({
    usersTable: { id: "id", name: "name" },
    eq: vi.fn(),
    db: {
        select: () => ({ from: () => ({ where: selectMock }) }),
        update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
    },
}));

import { updateUser } from "../update";

describe("updateUser", () => {
    beforeEach(() => vi.clearAllMocks());

    it("tells the listeners when the name changed", async () => {
        selectMock.mockResolvedValue([{ name: "Ana" }]);
        readUserMock.mockResolvedValue({ id: "u1", name: "Ana Souza" });

        const user = await updateUser("u1", { name: "Ana Souza" });

        expect(user).toEqual({ id: "u1", name: "Ana Souza" });
        expect(publishMock).toHaveBeenCalledWith({
            userId: "u1",
            name: "Ana Souza",
        });
    });

    it("tells nobody when the name is the same", async () => {
        selectMock.mockResolvedValue([{ name: "Ana" }]);
        readUserMock.mockResolvedValue({ id: "u1", name: "Ana" });

        await updateUser("u1", { name: "Ana" });

        expect(publishMock).not.toHaveBeenCalled();
    });
});
