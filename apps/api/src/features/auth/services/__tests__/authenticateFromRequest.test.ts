import { beforeEach, describe, expect, it, vi } from "vitest";
import { ServiceTokenExpiredError } from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    authenticateToken: vi.fn(),
    findById: vi.fn(),
    verifyJWT: vi.fn(),
}));

vi.mock("@standin/core", () => ({
    ServiceTokenService: {
        authenticate: mocks.authenticateToken,
        isServiceToken: (token: string) => token.startsWith("sit_"),
    },
    UserService: { findById: mocks.findById },
}));
vi.mock("@/lib/jwt", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/jwt")>()),
    verifyJWT: mocks.verifyJWT,
}));

import { authenticateFromRequest } from "../authenticateFromRequest";
import { UserCache } from "../userCache";

const admin = { id: "admin-1", role: "ADMIN" };
const request = (authorization?: string, cookie?: string) =>
    ({
        headers: { authorization },
        cookies: cookie ? { token: cookie } : undefined,
    }) as never;

beforeEach(() => {
    vi.resetAllMocks();
    UserCache.clear();
    mocks.findById.mockResolvedValue(admin);
});

describe("authenticateFromRequest", () => {
    it("authenticates a JWT from the header", async () => {
        mocks.verifyJWT.mockReturnValue({ id: "admin-1" });

        const user = await authenticateFromRequest(request("Bearer jwt"));

        expect(user).toMatchObject({ id: "admin-1" });
    });

    it("authenticates a JWT from the cookie, with or without a scope", async () => {
        mocks.verifyJWT.mockReturnValue({ id: "admin-1" });

        const user = await authenticateFromRequest(
            request(undefined, "jwt"),
            { scope: "maps:write" }
        );

        expect(user).toMatchObject({ id: "admin-1" });
        expect(mocks.authenticateToken).not.toHaveBeenCalled();
    });

    it("refuses a service token when the route names no scope", async () => {
        const user = await authenticateFromRequest(request("Bearer sit_abc"));

        expect(user).toBe(false);
        expect(mocks.authenticateToken).not.toHaveBeenCalled();
        expect(mocks.verifyJWT).not.toHaveBeenCalled();
    });

    it("never takes a service token from the cookie", async () => {
        mocks.verifyJWT.mockReturnValue(false);

        const user = await authenticateFromRequest(
            request(undefined, "sit_abc"),
            { scope: "maps:write" }
        );

        expect(user).toBe(false);
        expect(mocks.authenticateToken).not.toHaveBeenCalled();
    });

    it("acts as the creator of the service token", async () => {
        mocks.authenticateToken.mockResolvedValue({ createdById: "admin-1" });

        const user = await authenticateFromRequest(request("Bearer sit_abc"), {
            scope: "maps:write",
        });

        expect(mocks.authenticateToken).toHaveBeenCalledWith(
            "sit_abc",
            "maps:write"
        );
        expect(mocks.findById).toHaveBeenCalledWith("admin-1");
        expect(user).toMatchObject({ id: "admin-1" });
    });

    it("is false for an unknown service token", async () => {
        mocks.authenticateToken.mockResolvedValue(null);

        const user = await authenticateFromRequest(request("Bearer sit_abc"), {
            scope: "maps:write",
        });

        expect(user).toBe(false);
    });

    it("is false when the creator no longer exists", async () => {
        mocks.authenticateToken.mockResolvedValue({ createdById: "gone" });
        mocks.findById.mockResolvedValue(null);

        const user = await authenticateFromRequest(request("Bearer sit_abc"), {
            scope: "maps:write",
        });

        expect(user).toBe(false);
    });

    it("lets the reason of a refused token through", async () => {
        mocks.authenticateToken.mockRejectedValue(new ServiceTokenExpiredError());

        await expect(
            authenticateFromRequest(request("Bearer sit_abc"), {
                scope: "maps:write",
            })
        ).rejects.toBeInstanceOf(ServiceTokenExpiredError);
    });

    it("is false without any token", async () => {
        expect(await authenticateFromRequest(request())).toBe(false);
    });
});
