import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ServiceTokenExpiredError,
    ServiceTokenNotActiveError,
    ServiceTokenNotFoundError,
    ServiceTokenRevokedError,
    ServiceTokenScopeError,
} from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    create: vi.fn(),
    findByHash: vi.fn(),
    findById: vi.fn(),
    list: vi.fn(),
    regenerate: vi.fn(),
    remove: vi.fn(),
    revoke: vi.fn(),
    touchLastUsed: vi.fn(),
}));

vi.mock("../../repository", () => ({ ServiceTokenRepository: mocks }));

import { authenticateServiceToken } from "../authenticate";
import { createServiceToken } from "../create";
import { regenerateServiceToken } from "../regenerate";
import { removeServiceToken } from "../remove";
import { revokeServiceToken } from "../revoke";
import { hashToken } from "../../utils/hashToken";

const DAY = 86_400_000;
const row = (overrides: Record<string, unknown> = {}) => ({
    id: "t1",
    name: "CI",
    tokenPrefix: "sit_abcdefgh",
    scopes: ["maps:write"],
    createdById: "admin-1",
    lastUsedAt: null,
    expiresAt: null,
    revokedAt: null,
    ...overrides,
});

beforeEach(() => {
    vi.resetAllMocks();
    mocks.touchLastUsed.mockResolvedValue(undefined);
});

describe("createServiceToken", () => {
    it("stores the hash and the prefix, never the clear token", async () => {
        mocks.create.mockImplementation(async (input) => row(input));

        const result = await createServiceToken("admin-1", {
            name: "CI",
            scopes: ["maps:write", "maps:write"],
        });

        const stored = mocks.create.mock.calls[0][0];
        expect(result.token.startsWith("sit_")).toBe(true);
        expect(stored.tokenHash).toBe(hashToken(result.token));
        expect(stored.tokenPrefix).toBe(result.token.slice(0, 12));
        expect(stored.scopes).toEqual(["maps:write"]);
        expect(stored.createdById).toBe("admin-1");
        expect(JSON.stringify(stored)).not.toContain(result.token);
    });
});

describe("revokeServiceToken", () => {
    it("revokes an active token", async () => {
        mocks.findById.mockResolvedValue(row());
        mocks.revoke.mockResolvedValue(row({ revokedAt: new Date() }));

        const result = await revokeServiceToken("t1");

        expect(mocks.revoke).toHaveBeenCalledWith("t1", expect.any(Date));
        expect(result.revokedAt).toBeInstanceOf(Date);
    });

    it("keeps the first revocation when revoked again", async () => {
        const revokedAt = new Date("2026-01-01");
        mocks.findById.mockResolvedValue(row({ revokedAt }));

        const result = await revokeServiceToken("t1");

        expect(mocks.revoke).not.toHaveBeenCalled();
        expect(result.revokedAt).toBe(revokedAt);
    });

    it("fails for an unknown id", async () => {
        mocks.findById.mockResolvedValue(null);

        await expect(revokeServiceToken("nope")).rejects.toBeInstanceOf(
            ServiceTokenNotFoundError
        );
    });
});

describe("regenerateServiceToken", () => {
    it("swaps the hash and the prefix and returns the new clear token", async () => {
        mocks.findById.mockResolvedValue(row());
        mocks.regenerate.mockImplementation(async (_id, input) =>
            row({ tokenPrefix: input.tokenPrefix })
        );

        const result = await regenerateServiceToken("t1");

        const [id, input] = mocks.regenerate.mock.calls[0];
        expect(id).toBe("t1");
        expect(result.token.startsWith("sit_")).toBe(true);
        expect(input.tokenHash).toBe(hashToken(result.token));
        expect(input.tokenPrefix).toBe(result.token.slice(0, 12));
        expect(JSON.stringify(input)).not.toContain(result.token);
    });

    it("gives a different token each time", async () => {
        mocks.findById.mockResolvedValue(row());
        mocks.regenerate.mockResolvedValue(row());

        const first = await regenerateServiceToken("t1");
        const second = await regenerateServiceToken("t1");

        expect(first.token).not.toBe(second.token);
    });

    it("fails for an unknown id", async () => {
        mocks.findById.mockResolvedValue(null);

        await expect(regenerateServiceToken("nope")).rejects.toBeInstanceOf(
            ServiceTokenNotFoundError
        );
    });

    it.each([
        ["revoked", { revokedAt: new Date() }],
        ["expired", { expiresAt: new Date(Date.now() - DAY) }],
    ])("refuses a %s token", async (_label, overrides) => {
        mocks.findById.mockResolvedValue(row(overrides));

        await expect(regenerateServiceToken("t1")).rejects.toBeInstanceOf(
            ServiceTokenNotActiveError
        );
        expect(mocks.regenerate).not.toHaveBeenCalled();
    });

    it("refuses when the token was revoked while regenerating", async () => {
        mocks.findById.mockResolvedValue(row());
        mocks.regenerate.mockResolvedValue(null);

        await expect(regenerateServiceToken("t1")).rejects.toBeInstanceOf(
            ServiceTokenNotActiveError
        );
    });
});

describe("removeServiceToken", () => {
    it("removes the row", async () => {
        mocks.remove.mockResolvedValue(true);

        await expect(removeServiceToken("t1")).resolves.toBeUndefined();
        expect(mocks.remove).toHaveBeenCalledWith("t1");
    });

    it("fails for an unknown id", async () => {
        mocks.remove.mockResolvedValue(false);

        await expect(removeServiceToken("nope")).rejects.toBeInstanceOf(
            ServiceTokenNotFoundError
        );
    });
});

describe("authenticateServiceToken", () => {
    it("looks the token up by hash and touches lastUsedAt", async () => {
        mocks.findByHash.mockResolvedValue(row());

        const result = await authenticateServiceToken("sit_x", "maps:write");

        expect(mocks.findByHash).toHaveBeenCalledWith(hashToken("sit_x"));
        expect(result?.id).toBe("t1");
        expect(mocks.touchLastUsed).toHaveBeenCalledWith("t1", expect.any(Date));
    });

    it("does not touch lastUsedAt twice in a minute", async () => {
        mocks.findByHash.mockResolvedValue(
            row({ lastUsedAt: new Date(Date.now() - 1000) })
        );

        await authenticateServiceToken("sit_x", "maps:write");

        expect(mocks.touchLastUsed).not.toHaveBeenCalled();
    });

    it("returns null for an unknown token", async () => {
        mocks.findByHash.mockResolvedValue(null);

        expect(await authenticateServiceToken("sit_x", "maps:write")).toBeNull();
    });

    it.each([
        ["revoked", { revokedAt: new Date() }, ServiceTokenRevokedError],
        ["expired", { expiresAt: new Date(Date.now() - DAY) }, ServiceTokenExpiredError],
    ])("rejects a %s token", async (_label, overrides, error) => {
        mocks.findByHash.mockResolvedValue(row(overrides));

        await expect(
            authenticateServiceToken("sit_x", "maps:write")
        ).rejects.toBeInstanceOf(error);
        expect(mocks.touchLastUsed).not.toHaveBeenCalled();
    });

    it("rejects a token without the scope", async () => {
        mocks.findByHash.mockResolvedValue(row());

        await expect(
            authenticateServiceToken("sit_x", "library:write")
        ).rejects.toBeInstanceOf(ServiceTokenScopeError);
    });

    it("accepts a token that has not expired yet", async () => {
        mocks.findByHash.mockResolvedValue(
            row({ expiresAt: new Date(Date.now() + DAY) })
        );

        expect(
            await authenticateServiceToken("sit_x", "maps:write")
        ).not.toBeNull();
    });
});
