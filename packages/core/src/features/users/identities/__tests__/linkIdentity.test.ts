import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    target: { current: undefined as { id: string } | undefined },
    insertValues: vi.fn(),
    insertFails: { current: null as unknown },
    release: vi.fn(),
    readUser: vi.fn(),
    findByIdentity: vi.fn(),
    assignRandomAvatar: vi.fn(),
    updateProfilePicture: vi.fn(),
    normalizeEmail: vi.fn((email: string) => email.trim().toLowerCase()),
}));

vi.mock("../../utils/readUser", () => ({ readUser: mocks.readUser }));
vi.mock("../findByIdentity", () => ({
    findUserByIdentity: mocks.findByIdentity,
}));
vi.mock("../releaseDeletedIdentity", () => ({
    releaseDeletedIdentity: mocks.release,
}));
vi.mock("../../../avatar/user/assignRandomAvatar", () => ({
    assignRandomAvatar: mocks.assignRandomAvatar,
}));
vi.mock("../../updateProfilePicture", () => ({
    updateProfilePicture: mocks.updateProfilePicture,
}));
vi.mock("@standin/contracts", () => ({
    normalizeEmail: mocks.normalizeEmail,
}));
vi.mock("@standin/database", () => {
    const tx = {
        insert: () => ({
            values: async (values: unknown) => {
                mocks.insertValues(values);
                if (mocks.insertFails.current) throw mocks.insertFails.current;
            },
        }),
    };
    return {
        usersTable: { id: "id", email: "email", deletedAt: "deleted_at" },
        userIdentitiesTable: {},
        eq: vi.fn(),
        and: vi.fn(),
        isNull: vi.fn(),
        db: {
            select: () => ({
                from: () => ({
                    where: async () =>
                        mocks.target.current ? [mocks.target.current] : [],
                }),
            }),
            transaction: async (run: (tx: unknown) => Promise<unknown>) =>
                run(tx),
        },
    };
});

import { linkIdentity } from "../linkIdentity";

const identity = {
    provider: "github",
    providerUserId: "42",
    providerLogin: "ana-dev",
} as const;
const input = { identity, email: " Ana@Example.com " };

describe("linkIdentity", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.target.current = { id: "u1" };
        mocks.insertFails.current = null;
        mocks.readUser.mockResolvedValue({ id: "u1", name: "Ana" });
    });

    it("links the provider account to the person with that e-mail", async () => {
        const user = await linkIdentity(input);

        expect(mocks.normalizeEmail).toHaveBeenCalledWith(" Ana@Example.com ");
        expect(mocks.insertValues).toHaveBeenCalledWith({
            userId: "u1",
            ...identity,
        });
        expect(user).toEqual({ id: "u1", name: "Ana" });
    });

    it("frees the account of a deleted person before linking", async () => {
        await linkIdentity(input);

        expect(mocks.release).toHaveBeenCalledWith(expect.anything(), identity);
    });

    it("returns null when no active person has the e-mail", async () => {
        mocks.target.current = undefined;

        expect(await linkIdentity(input)).toBeNull();
        expect(mocks.insertValues).not.toHaveBeenCalled();
    });

    it("reads the owner again when another request linked it first", async () => {
        mocks.insertFails.current = { cause: { code: "23505" } };
        mocks.findByIdentity.mockResolvedValue({ id: "u1", name: "Ana" });

        const user = await linkIdentity(input);

        expect(mocks.findByIdentity).toHaveBeenCalledWith(identity);
        expect(user).toEqual({ id: "u1", name: "Ana" });
    });

    it("lets other database errors go up", async () => {
        mocks.insertFails.current = new Error("db down");

        await expect(linkIdentity(input)).rejects.toThrow("db down");
    });

    it("never gives an avatar nor touches the profile picture", async () => {
        await linkIdentity(input);

        expect(mocks.assignRandomAvatar).not.toHaveBeenCalled();
        expect(mocks.updateProfilePicture).not.toHaveBeenCalled();
    });
});
