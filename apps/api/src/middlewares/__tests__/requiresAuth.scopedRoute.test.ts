import http from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
    ServiceTokenRevokedError,
    ServiceTokenScopeError,
} from "@standin/contracts";

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

import { UserCache } from "@/features/auth/services/userCache";
import { RequiresAuth } from "../requiresAuth";

// A small router with one session-only route and one scoped route, to see the
// middleware over real HTTP without a database.
describe("RequiresAuth over a test router", () => {
    let server: http.Server;
    let baseUrl: string;

    const get = async (route: string, authorization?: string) => {
        const response = await fetch(`${baseUrl}${route}`, {
            headers: authorization ? { authorization } : {},
        });
        return { status: response.status, body: await response.json() };
    };

    beforeAll(async () => {
        const app = express();
        const whoami = (req: any, res: any) =>
            res.json({ id: req.user.id });
        app.get("/session", RequiresAuth, whoami);
        app.get("/scoped", RequiresAuth.scoped("maps:write"), whoami);
        server = http.createServer(app);
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    beforeEach(() => {
        vi.resetAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        UserCache.clear();
        mocks.findById.mockImplementation(async (id: string) => ({ id }));
    });

    it("lets a session through both routes", async () => {
        mocks.verifyJWT.mockReturnValue({ id: "admin-1" });

        expect((await get("/session", "Bearer jwt")).status).toBe(200);
        expect((await get("/scoped", "Bearer jwt")).body).toEqual({
            id: "admin-1",
        });
    });

    it("lets a service token through the scoped route only", async () => {
        mocks.authenticateToken.mockResolvedValue({ createdById: "admin-1" });

        const scoped = await get("/scoped", "Bearer sit_abc");
        const session = await get("/session", "Bearer sit_abc");

        expect(scoped).toEqual({ status: 200, body: { id: "admin-1" } });
        expect(session.status).toBe(401);
    });

    it("answers 401 for a revoked token and 403 out of scope", async () => {
        mocks.authenticateToken.mockRejectedValueOnce(
            new ServiceTokenRevokedError()
        );
        const revoked = await get("/scoped", "Bearer sit_abc");

        mocks.authenticateToken.mockRejectedValueOnce(
            new ServiceTokenScopeError("maps:write")
        );
        const outOfScope = await get("/scoped", "Bearer sit_abc");

        expect(revoked.status).toBe(401);
        expect(revoked.body.code).toBe("SERVICE_TOKEN_REVOKED");
        expect(outOfScope.status).toBe(403);
        expect(outOfScope.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
    });

    it("answers 401 without credentials", async () => {
        expect((await get("/scoped")).status).toBe(401);
    });
});
