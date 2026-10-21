import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    rows: { current: [] as unknown[] },
    compare: vi.fn(),
}));

vi.mock("bcryptjs", () => ({ default: { compare: mocks.compare } }));
vi.mock("../utils/toUser", () => ({
    toUser: (row: Record<string, unknown>) => ({ ...row, mapped: true }),
}));
vi.mock("../consts/select", () => ({ userSelect: {} }));
vi.mock("../utils/profilePictureJoin", () => ({ profilePictureJoin: {} }));
vi.mock("@standin/database", () => ({
    usersTable: {
        email: "email",
        deletedAt: "deleted_at",
        password: "password",
    },
    userProfilePicturesTable: {},
    eq: vi.fn(),
    and: vi.fn(),
    isNull: vi.fn(),
    db: {
        select: () => ({
            from: () => ({
                leftJoin: () => ({
                    where: async () => mocks.rows.current,
                }),
            }),
        }),
    },
}));

import { isUserValid } from "../isValid";

const credentials = { email: "ana@example.com", password: "Strong-Password-1" };

describe("isUserValid", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.rows.current = [];
    });

    it("refuses an unknown e-mail", async () => {
        expect(await isUserValid(credentials)).toBe(false);
        expect(mocks.compare).not.toHaveBeenCalled();
    });

    it("refuses a person with no password without calling bcrypt", async () => {
        mocks.rows.current = [{ id: "u1", password: null }];

        expect(await isUserValid(credentials)).toBe(false);
        expect(mocks.compare).not.toHaveBeenCalled();
    });

    it("refuses a wrong password", async () => {
        mocks.rows.current = [{ id: "u1", password: "hash" }];
        mocks.compare.mockResolvedValue(false);

        expect(await isUserValid(credentials)).toBe(false);
    });

    it("returns the person without the password hash", async () => {
        mocks.rows.current = [{ id: "u1", password: "hash" }];
        mocks.compare.mockResolvedValue(true);

        const user = await isUserValid(credentials);

        expect(user).toEqual({ id: "u1", mapped: true });
        expect(user).not.toHaveProperty("password");
    });
});
