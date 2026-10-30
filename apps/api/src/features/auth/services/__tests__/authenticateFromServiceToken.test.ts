import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ServiceTokenOwnerInvalidError,
    ServiceTokenScopeError,
} from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    authenticateToken: vi.fn(),
    findById: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    ServiceTokenService: { authenticate: mocks.authenticateToken },
    UserService: { findById: mocks.findById },
}));

import { UserCache } from "../userCache";
import { authenticateFromServiceToken } from "../authenticateFromServiceToken";

describe("authenticateFromServiceToken", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        UserCache.clear();
        mocks.authenticateToken.mockResolvedValue({ createdById: "u1" });
    });

    it("acts as the owner when the owner is an admin", async () => {
        mocks.findById.mockResolvedValue({ id: "u1", role: "ADMIN" });

        const user = await authenticateFromServiceToken("sit_a", "maps:read");

        expect(user).toEqual({ id: "u1", role: "ADMIN" });
        expect(mocks.authenticateToken).toHaveBeenCalledWith(
            "sit_a",
            "maps:read"
        );
    });

    it("refuses a token whose owner is no longer an admin", async () => {
        mocks.findById.mockResolvedValue({ id: "u1", role: "USER" });

        await expect(
            authenticateFromServiceToken("sit_a", "maps:write")
        ).rejects.toBeInstanceOf(ServiceTokenOwnerInvalidError);
    });

    it("refuses a token whose owner does not exist", async () => {
        mocks.findById.mockResolvedValue(null);

        await expect(
            authenticateFromServiceToken("sit_a", "maps:read")
        ).rejects.toBeInstanceOf(ServiceTokenOwnerInvalidError);
    });

    it("lets the error of an invalid token through", async () => {
        mocks.authenticateToken.mockRejectedValue(
            new ServiceTokenScopeError("maps:read")
        );

        await expect(
            authenticateFromServiceToken("sit_a", "maps:read")
        ).rejects.toBeInstanceOf(ServiceTokenScopeError);
        expect(mocks.findById).not.toHaveBeenCalled();
    });

    it("returns false when the token is unknown", async () => {
        mocks.authenticateToken.mockResolvedValue(null);

        expect(await authenticateFromServiceToken("sit_a", "maps:read")).toBe(
            false
        );
    });
});
