import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    rows: { current: [] as unknown[] },
    where: vi.fn(),
    orderBy: vi.fn(),
}));

vi.mock("@standin/database", () => ({
    usersTable: { id: "id", email: "email", role: "role", deletedAt: "d" },
    eq: (...args: unknown[]) => ["eq", ...args],
    isNull: (...args: unknown[]) => ["isNull", ...args],
    and: (...args: unknown[]) => ["and", ...args],
    asc: (column: unknown) => ["asc", column],
    db: {
        select: () => ({
            from: () => ({
                where: (condition: unknown) => {
                    mocks.where(condition);
                    return {
                        orderBy: async (order: unknown) => {
                            mocks.orderBy(order);
                            return mocks.rows.current;
                        },
                    };
                },
            }),
        }),
    },
}));

import { listActiveAdmins } from "../listActiveAdmins";

describe("listActiveAdmins (repository)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.rows.current = [];
    });

    it("asks for the active admins ordered by email", async () => {
        mocks.rows.current = [{ id: "a1", email: "a@example.com" }];

        await expect(listActiveAdmins()).resolves.toEqual(mocks.rows.current);
        expect(mocks.where).toHaveBeenCalledWith([
            "and",
            ["eq", "role", "ADMIN"],
            ["isNull", "d"],
        ]);
        expect(mocks.orderBy).toHaveBeenCalledWith(["asc", "email"]);
    });
});
