import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    rows: { current: [] as unknown[] },
    isNull: vi.fn((column: string) => `null:${column}`),
}));

vi.mock("../../utils/toUser", () => ({
    toUser: (row: Record<string, unknown>) => ({ ...row, mapped: true }),
}));
vi.mock("../../consts/select", () => ({ userSelect: {} }));
vi.mock("../../utils/profilePictureJoin", () => ({ profilePictureJoin: {} }));
vi.mock("@standin/database", () => ({
    usersTable: { id: "users.id", deletedAt: "users.deleted_at" },
    userIdentitiesTable: {
        userId: "identities.user_id",
        provider: "identities.provider",
        providerUserId: "identities.provider_user_id",
    },
    userProfilePicturesTable: {},
    eq: vi.fn(),
    and: vi.fn((...conditions: unknown[]) => conditions),
    isNull: mocks.isNull,
    db: {
        select: () => ({
            from: () => ({
                innerJoin: () => ({
                    leftJoin: () => ({
                        where: async () => mocks.rows.current,
                    }),
                }),
            }),
        }),
    },
}));

import { findUserByIdentity } from "../findByIdentity";

const key = { provider: "github", providerUserId: "42" } as const;

describe("findUserByIdentity", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.rows.current = [];
    });

    it("returns the owner of the provider account", async () => {
        mocks.rows.current = [{ id: "u1" }];

        expect(await findUserByIdentity(key)).toEqual({
            id: "u1",
            mapped: true,
        });
    });

    it("returns null when no one owns it", async () => {
        expect(await findUserByIdentity(key)).toBeNull();
    });

    it("only looks at people who are not deleted", async () => {
        await findUserByIdentity(key);

        expect(mocks.isNull).toHaveBeenCalledWith("users.deleted_at");
    });
});
