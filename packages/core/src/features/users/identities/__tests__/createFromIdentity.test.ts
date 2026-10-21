import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    existing: { current: undefined as { id: string } | undefined },
    userValues: vi.fn(),
    identityValues: vi.fn(),
    identityFails: { current: null as unknown },
    release: vi.fn(),
    readUser: vi.fn(),
    findByIdentity: vi.fn(),
    assignRandomAvatar: vi.fn(),
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
vi.mock("@standin/database", () => {
    const usersTable = { id: "id", email: "email", deletedAt: "deleted_at" };
    const userIdentitiesTable = { marker: "identities" };
    const tx = {
        select: () => ({
            from: () => ({
                where: async () =>
                    mocks.existing.current ? [mocks.existing.current] : [],
            }),
        }),
        insert: (table: unknown) => ({
            values: (values: unknown) => {
                if (table === usersTable) {
                    mocks.userValues(values);
                    return { returning: async () => [{ id: "new" }] };
                }
                mocks.identityValues(values);
                if (mocks.identityFails.current) {
                    return Promise.reject(mocks.identityFails.current);
                }
                return Promise.resolve();
            },
        }),
    };
    return {
        usersTable,
        userIdentitiesTable,
        eq: vi.fn(),
        and: vi.fn(),
        isNull: vi.fn(),
        db: {
            transaction: async (run: (tx: unknown) => Promise<unknown>) =>
                run(tx),
        },
    };
});

import { UserAlreadyExistsError } from "@standin/contracts";
import { createUserFromIdentity } from "../createFromIdentity";

const identity = {
    provider: "github",
    providerUserId: "42",
    providerLogin: "ana-dev",
} as const;
const input = { identity, name: "Ana", email: "Ana@Example.com" };

describe("createUserFromIdentity", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.existing.current = undefined;
        mocks.identityFails.current = null;
        mocks.readUser.mockResolvedValue({ id: "new", name: "Ana" });
    });

    it("creates a person with no password and the link", async () => {
        const result = await createUserFromIdentity(input);

        expect(mocks.userValues).toHaveBeenCalledWith({
            name: "Ana",
            email: "ana@example.com",
            password: null,
        });
        expect(mocks.identityValues).toHaveBeenCalledWith({
            userId: "new",
            ...identity,
        });
        expect(result).toEqual({
            user: { id: "new", name: "Ana" },
            created: true,
        });
    });

    it("gives the random avatar, and only here", async () => {
        await createUserFromIdentity(input);

        expect(mocks.assignRandomAvatar).toHaveBeenCalledExactlyOnceWith("new");
    });

    it("never takes the place of an active person with the same e-mail", async () => {
        mocks.existing.current = { id: "u1" };

        await expect(createUserFromIdentity(input)).rejects.toBeInstanceOf(
            UserAlreadyExistsError
        );
        expect(mocks.userValues).not.toHaveBeenCalled();
        expect(mocks.assignRandomAvatar).not.toHaveBeenCalled();
    });

    it("frees the provider account of a deleted person, which stays deleted", async () => {
        await createUserFromIdentity(input);

        expect(mocks.release).toHaveBeenCalledWith(expect.anything(), identity);
        expect(mocks.findByIdentity).not.toHaveBeenCalled();
    });

    it("reads the winner when two requests race on the same account", async () => {
        mocks.identityFails.current = { cause: { code: "23505" } };
        mocks.findByIdentity.mockResolvedValue({ id: "winner" });

        const result = await createUserFromIdentity(input);

        expect(result).toEqual({ user: { id: "winner" }, created: false });
        expect(mocks.assignRandomAvatar).not.toHaveBeenCalled();
    });

    it("refuses when the unique index fires and nobody owns the account", async () => {
        mocks.identityFails.current = { code: "23505" };
        mocks.findByIdentity.mockResolvedValue(null);

        await expect(createUserFromIdentity(input)).rejects.toBeInstanceOf(
            UserAlreadyExistsError
        );
    });

    it("lets other database errors go up", async () => {
        mocks.identityFails.current = new Error("db down");

        await expect(createUserFromIdentity(input)).rejects.toThrow("db down");
    });
});
