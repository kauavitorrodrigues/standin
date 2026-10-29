import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    ServiceTokenRevokedError,
    ServiceTokenScopeError,
} from "@standin/contracts";

const { authenticateMock } = vi.hoisted(() => ({ authenticateMock: vi.fn() }));

vi.mock("@/features/auth/services/authenticateFromRequest", () => ({
    authenticateFromRequest: authenticateMock,
}));

import { RequiresAuth } from "../requiresAuth";

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
};

describe("RequiresAuth", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("asks for a session only and sets the user", async () => {
        authenticateMock.mockResolvedValue({ id: "u1" });
        const req: any = {};
        const next = vi.fn();

        await RequiresAuth(req, buildRes(), next);

        expect(authenticateMock).toHaveBeenCalledWith(req, {});
        expect(req.user).toEqual({ id: "u1" });
        expect(next).toHaveBeenCalled();
    });

    it("answers 401 when nobody is authenticated", async () => {
        authenticateMock.mockResolvedValue(false);
        const res = buildRes();
        const next = vi.fn();

        await RequiresAuth({} as any, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });
});

describe("RequiresAuth.scoped", () => {
    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("passes the scope to the authentication", async () => {
        authenticateMock.mockResolvedValue({ id: "u1" });
        const req: any = {};
        const next = vi.fn();

        await RequiresAuth.scoped("maps:write")(req, buildRes(), next);

        expect(authenticateMock).toHaveBeenCalledWith(req, {
            scope: "maps:write",
        });
        expect(next).toHaveBeenCalled();
    });

    it("answers a revoked token with 401 and its code", async () => {
        authenticateMock.mockRejectedValue(new ServiceTokenRevokedError());
        const res = buildRes();
        const next = vi.fn();

        await RequiresAuth.scoped("maps:write")({} as any, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: "This service token was revoked.",
            code: "SERVICE_TOKEN_REVOKED",
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("answers an out of scope token with 403", async () => {
        authenticateMock.mockRejectedValue(
            new ServiceTokenScopeError("maps:write")
        );
        const res = buildRes();

        await RequiresAuth.scoped("maps:write")({} as any, res, vi.fn());

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it("lets an unexpected error go to the error handler", async () => {
        const boom = new TypeError("db down");
        authenticateMock.mockRejectedValue(boom);

        await expect(
            RequiresAuth.scoped("maps:write")({} as any, buildRes(), vi.fn())
        ).rejects.toBe(boom);
    });
});
