import http from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import {
    ServiceTokenExpiredError,
    ServiceTokenRevokedError,
    ServiceTokenScopeError,
} from "@standin/contracts";

const mocks = vi.hoisted(() => {
    // Every handler answers with its own path in the controller, so the test
    // sees which one a request reached without a database.
    const buildHandler = (path: string): any =>
        new Proxy((_req: any, res: any) => res.json({ handler: path }), {
            get: (target, key) => {
                if (key in target) return Reflect.get(target, key);
                return buildHandler(`${path}.${String(key)}`);
            },
        });

    return {
        buildHandler,
        authenticateToken: vi.fn(),
        findById: vi.fn(),
        getAccess: vi.fn(),
        verifyJWT: vi.fn(),
    };
});

vi.mock("@standin/core", () => ({
    ServiceTokenService: {
        authenticate: mocks.authenticateToken,
        isServiceToken: (token: string) => token.startsWith("sit_"),
    },
    UserService: { findById: mocks.findById },
    MapService: { getAccess: mocks.getAccess },
}));
vi.mock("@/lib/jwt", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/jwt")>()),
    verifyJWT: mocks.verifyJWT,
}));

vi.mock("@/features/maps/controllers", () => ({
    MapController: mocks.buildHandler("map"),
}));
vi.mock("@/features/library/controllers", () => ({
    LibraryController: mocks.buildHandler("library"),
}));

import { UserCache } from "@/features/auth/services/userCache";
import { libraryReadRouter } from "@/features/library/routes";
import { mapApplyRouter, mapReadRouter } from "@/features/maps/routes";

type Role = "ADMIN" | "USER";

const MAP_READ_ROUTES: readonly [string, string][] = [
    ["/maps/00000000-0000-4000-8000-000000000001/render", "map.render"],
    ["/maps/00000000-0000-4000-8000-000000000001/library", "map.library"],
    ["/maps/00000000-0000-4000-8000-000000000001/export", "map.export"],
];

const LIBRARY_READ_ROUTES: readonly [string, string][] = [
    ["/library/overview", "library.overview"],
    ["/library/palette", "library.palette"],
    ["/library/tilesets", "library.tilesets.list"],
    ["/library/tilesets/t1", "library.tilesets.details"],
    ["/library/assets", "library.assets.list"],
    ["/library/assets/facets", "library.assets.facets"],
    ["/library/assets/a1", "library.assets.details"],
    ["/library/areas", "library.areas.list"],
    ["/library/areas/r1", "library.areas.details"],
];

// The real read routers over HTTP, with the token service and the map access
// faked: what the scope lets a token reach, and nothing else.
describe("read routers and service tokens", () => {
    let server: http.Server;
    let baseUrl: string;
    let owner: { id: string; role: Role };

    const call = async (
        method: string,
        route: string,
        authorization?: string
    ) => {
        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers: authorization ? { authorization } : {},
        });
        const text = await response.text();
        return {
            status: response.status,
            body: text ? JSON.parse(text) : null,
        };
    };

    // A token that has exactly these scopes, the way the core service decides.
    const tokenWith = (...granted: string[]) =>
        mocks.authenticateToken.mockImplementation(
            async (_token: string, scope: string) => {
                if (!granted.includes(scope))
                    throw new ServiceTokenScopeError(scope);
                return { createdById: owner.id };
            }
        );

    beforeAll(async () => {
        const app = express();
        app.use("/maps", mapApplyRouter);
        app.use("/maps", mapReadRouter);
        app.use("/library", libraryReadRouter);
        // What the session-only routers answer for a request nothing above took.
        app.use((_req, res) => res.status(401).json({ fallthrough: true }));
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
        owner = { id: "admin-1", role: "ADMIN" };
        mocks.findById.mockImplementation(async () => owner);
        mocks.getAccess.mockResolvedValue({
            canView: true,
            canRead: true,
            canEdit: true,
        });
    });

    describe("map reads with maps:read", () => {
        it.each(MAP_READ_ROUTES)(
            "lets a token through %s",
            async (route, handler) => {
                tokenWith("maps:read");

                const response = await call("GET", route, "Bearer sit_abc");

                expect(response).toEqual({ status: 200, body: { handler } });
            }
        );

        it.each(MAP_READ_ROUTES)(
            "refuses a token without the scope on %s",
            async (route) => {
                tokenWith("library:read", "maps:write", "templates:read");

                const response = await call("GET", route, "Bearer sit_abc");

                expect(response.status).toBe(403);
                expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
            }
        );

        it("keeps the map access check for a token", async () => {
            tokenWith("maps:read");
            mocks.getAccess.mockResolvedValue({
                canView: true,
                canRead: false,
                canEdit: false,
            });

            expect(
                (
                    await call(
                        "GET",
                        "/maps/00000000-0000-4000-8000-000000000001/library",
                        "Bearer sit_abc"
                    )
                ).status
            ).toBe(403);

            mocks.getAccess.mockResolvedValue({
                canView: false,
                canRead: false,
                canEdit: false,
            });

            expect(
                (
                    await call(
                        "GET",
                        "/maps/00000000-0000-4000-8000-000000000001/render",
                        "Bearer sit_abc"
                    )
                ).status
            ).toBe(404);
        });

        it("lets a session through, with its own access", async () => {
            mocks.verifyJWT.mockReturnValue({ id: "admin-1" });

            const response = await call(
                "GET",
                "/maps/00000000-0000-4000-8000-000000000001/render",
                "Bearer jwt"
            );

            expect(response.status).toBe(200);
            expect(mocks.authenticateToken).not.toHaveBeenCalled();
        });

        it("refuses nobody at all", async () => {
            expect(
                (
                    await call(
                        "GET",
                        "/maps/00000000-0000-4000-8000-000000000001/render"
                    )
                ).status
            ).toBe(401);
        });
    });

    describe("library reads with library:read", () => {
        it.each(LIBRARY_READ_ROUTES)(
            "lets a token through %s",
            async (route, handler) => {
                tokenWith("library:read");

                const response = await call("GET", route, "Bearer sit_abc");

                expect(response).toEqual({ status: 200, body: { handler } });
            }
        );

        it.each(LIBRARY_READ_ROUTES)(
            "refuses a token without the scope on %s",
            async (route) => {
                tokenWith("maps:read", "library:write", "templates:read");

                const response = await call("GET", route, "Bearer sit_abc");

                expect(response.status).toBe(403);
                expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
            }
        );

        it("refuses a token whose owner is no longer an admin", async () => {
            tokenWith("library:read", "maps:read");
            owner = { id: "admin-1", role: "USER" };

            for (const route of [
                "/library/overview",
                "/maps/00000000-0000-4000-8000-000000000001/render",
            ]) {
                const response = await call("GET", route, "Bearer sit_abc");
                expect(response.status, route).toBe(401);
                expect(response.body.code).toBe("SERVICE_TOKEN_OWNER_INVALID");
            }

            tokenWith("maps:write");
            const apply = await call(
                "POST",
                "/maps/00000000-0000-4000-8000-000000000001/apply",
                "Bearer sit_abc"
            );
            expect(apply.status).toBe(401);
            expect(apply.body.code).toBe("SERVICE_TOKEN_OWNER_INVALID");
        });

        it("still refuses an organization scope chosen by the client", async () => {
            tokenWith("library:read");

            const response = await call(
                "GET",
                "/library/areas?organizationId=org-1",
                "Bearer sit_abc"
            );

            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SCOPE_FORBIDDEN");
        });

        it("keeps the admin check for a session", async () => {
            mocks.verifyJWT.mockReturnValue({ id: "user-1" });
            owner = { id: "user-1", role: "USER" };

            const member = await call("GET", "/library/overview", "Bearer jwt");
            owner = { id: "admin-1", role: "ADMIN" };
            UserCache.clear();
            const admin = await call("GET", "/library/overview", "Bearer jwt");

            expect(member.status).toBe(403);
            expect(admin.status).toBe(200);
        });
    });

    describe("revoked and expired tokens", () => {
        it.each([
            [
                "a revoked token",
                new ServiceTokenRevokedError(),
                "SERVICE_TOKEN_REVOKED",
            ],
            [
                "an expired token",
                new ServiceTokenExpiredError(),
                "SERVICE_TOKEN_EXPIRED",
            ],
        ])(
            "answers 401 for %s on both routers",
            async (_label, error, code) => {
                mocks.authenticateToken.mockRejectedValue(error);

                const map = await call(
                    "GET",
                    "/maps/00000000-0000-4000-8000-000000000001/render",
                    "Bearer sit_abc"
                );
                const library = await call(
                    "GET",
                    "/library/overview",
                    "Bearer sit_abc"
                );

                expect(map.status).toBe(401);
                expect(map.body.code).toBe(code);
                expect(library.status).toBe(401);
                expect(library.body.code).toBe(code);
            }
        );
    });

    describe("nothing else is reachable", () => {
        it.each([
            ["POST", "/library/tilesets"],
            ["PATCH", "/library/tilesets/t1"],
            ["PUT", "/library/tilesets/t1/grid"],
            ["DELETE", "/library/assets/a1"],
            ["PUT", "/library/areas/r1"],
            ["GET", "/library/avatar-parts"],
            ["GET", "/maps/00000000-0000-4000-8000-000000000001/areas/r1"],
            ["GET", "/maps/00000000-0000-4000-8000-000000000001/lock"],
            ["POST", "/maps/00000000-0000-4000-8000-000000000001/publish"],
            ["POST", "/maps/00000000-0000-4000-8000-000000000001/assets"],
        ])(
            "passes %s %s on to the session-only routers",
            async (method, route) => {
                tokenWith(
                    "library:read",
                    "library:write",
                    "maps:read",
                    "maps:write"
                );

                const response = await call(method, route, "Bearer sit_abc");

                expect(response).toEqual({
                    status: 401,
                    body: { fallthrough: true },
                });
            }
        );

        it("refuses a write scope on a read route", async () => {
            tokenWith("maps:write", "library:write");

            expect(
                (
                    await call(
                        "GET",
                        "/maps/00000000-0000-4000-8000-000000000001/export",
                        "Bearer sit_abc"
                    )
                ).status
            ).toBe(403);
            expect(
                (await call("GET", "/library/palette", "Bearer sit_abc")).status
            ).toBe(403);
        });

        it("refuses a read scope on the apply route", async () => {
            tokenWith("maps:read", "library:read");

            const response = await call(
                "POST",
                "/maps/00000000-0000-4000-8000-000000000001/apply",
                "Bearer sit_abc"
            );

            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
        });
    });
});
