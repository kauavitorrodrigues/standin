import { beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthEmailUnverifiedError } from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    findByIdentity: vi.fn(),
    linkIdentity: vi.fn(),
    createFromIdentity: vi.fn(),
    fetchVerifiedEmail: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    UserService: {
        findByIdentity: mocks.findByIdentity,
        linkIdentity: mocks.linkIdentity,
        createFromIdentity: mocks.createFromIdentity,
    },
}));
vi.mock("@standin/infra", () => ({
    GithubProvider: { getVerifiedEmail: mocks.fetchVerifiedEmail },
}));

import { resolveUser } from "../resolveUser";

const profile = {
    id: "42",
    login: "ana-dev",
    name: "Ana Souza",
    avatarUrl: null,
};
const identity = {
    provider: "github",
    providerUserId: "42",
    providerLogin: "ana-dev",
};

describe("resolveUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.findByIdentity.mockResolvedValue(null);
        mocks.linkIdentity.mockResolvedValue(null);
        mocks.fetchVerifiedEmail.mockResolvedValue("ana@example.com");
        mocks.createFromIdentity.mockResolvedValue({
            user: { id: "new" },
            created: true,
        });
    });

    it("signs in a linked account without asking GitHub for the e-mail", async () => {
        mocks.findByIdentity.mockResolvedValue({ id: "u1" });

        const result = await resolveUser({ accessToken: "t", profile });

        expect(result).toEqual({ user: { id: "u1" }, outcome: "existing" });
        expect(mocks.fetchVerifiedEmail).not.toHaveBeenCalled();
        expect(mocks.linkIdentity).not.toHaveBeenCalled();
        expect(mocks.createFromIdentity).not.toHaveBeenCalled();
    });

    it("links to the person who has the verified e-mail", async () => {
        mocks.linkIdentity.mockResolvedValue({ id: "u1" });

        const result = await resolveUser({ accessToken: "t", profile });

        expect(result).toEqual({ user: { id: "u1" }, outcome: "linked" });
        expect(mocks.linkIdentity).toHaveBeenCalledWith({
            identity,
            email: "ana@example.com",
        });
        expect(mocks.createFromIdentity).not.toHaveBeenCalled();
    });

    it("creates a person with the GitHub name and e-mail", async () => {
        const result = await resolveUser({ accessToken: "t", profile });

        expect(result).toEqual({ user: { id: "new" }, outcome: "created" });
        expect(mocks.createFromIdentity).toHaveBeenCalledWith({
            identity,
            email: "ana@example.com",
            name: "Ana Souza",
        });
    });

    it("uses the login when the name is empty", async () => {
        await resolveUser({
            accessToken: "t",
            profile: { ...profile, name: "  " },
        });

        expect(mocks.createFromIdentity).toHaveBeenCalledWith(
            expect.objectContaining({ name: "ana-dev" })
        );
    });

    it("refuses with no verified e-mail and links or creates nothing", async () => {
        mocks.fetchVerifiedEmail.mockResolvedValue(null);

        await expect(
            resolveUser({ accessToken: "t", profile })
        ).rejects.toBeInstanceOf(OAuthEmailUnverifiedError);
        expect(mocks.linkIdentity).not.toHaveBeenCalled();
        expect(mocks.createFromIdentity).not.toHaveBeenCalled();
    });

    it("signs in the winner when another request created the person first", async () => {
        mocks.createFromIdentity.mockResolvedValue({
            user: { id: "winner" },
            created: false,
        });

        const result = await resolveUser({ accessToken: "t", profile });

        expect(result).toEqual({ user: { id: "winner" }, outcome: "existing" });
    });
});
