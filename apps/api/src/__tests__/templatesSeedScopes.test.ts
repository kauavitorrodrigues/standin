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
vi.mock("@/features/maps/templates/controllers", () => ({
    TemplateController: mocks.buildHandler("template"),
}));

import { UserCache } from "@/features/auth/services/userCache";
import { libraryWriteRouter } from "@/features/library/routes";
import {
    templatesReadRouter,
    templatesWriteRouter,
} from "@/features/maps/templates/routes";

type Role = "ADMIN" | "USER";

const TEMPLATE_READ_ROUTES: readonly [string, string][] = [
    ["/templates", "template.list"],
    ["/templates/t1", "template.details"],
];

const TEMPLATE_WRITE_ROUTES: readonly [string, string, string][] = [
    ["POST", "/templates", "template.create"],
    ["PUT", "/templates/t1/thumbnail", "template.setThumbnail"],
    ["POST", "/templates/t1/publish", "template.publish"],
];

// The real template and library-seed routers over HTTP, with the token
// service faked: what each scope lets a token reach, and nothing else.
describe("template and seed routers and service tokens", () => {
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
        app.use("/templates", templatesReadRouter);
        app.use("/templates", templatesWriteRouter);
        app.use("/library", libraryWriteRouter);
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
    });

    describe("template reads with templates:read", () => {
        it.each(TEMPLATE_READ_ROUTES)(
            "lets a token through %s",
            async (route, handler) => {
                tokenWith("templates:read");

                const response = await call("GET", route, "Bearer sit_abc");

                expect(response).toEqual({ status: 200, body: { handler } });
            }
        );

        it.each(TEMPLATE_READ_ROUTES)(
            "refuses a token without the scope on %s",
            async (route) => {
                tokenWith("templates:write", "library:write", "maps:read");

                const response = await call("GET", route, "Bearer sit_abc");

                expect(response.status).toBe(403);
                expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
            }
        );

        it("lets a session that is not an admin reach the list handler", async () => {
            mocks.verifyJWT.mockReturnValue({ id: "user-1" });
            owner = { id: "user-1", role: "USER" };

            const response = await call("GET", "/templates", "Bearer jwt");

            expect(response).toEqual({
                status: 200,
                body: { handler: "template.list" },
            });
            expect(mocks.authenticateToken).not.toHaveBeenCalled();
        });

        it("lets an admin session reach the details", async () => {
            mocks.verifyJWT.mockReturnValue({ id: "admin-1" });

            const response = await call("GET", "/templates/t1", "Bearer jwt");

            expect(response).toEqual({
                status: 200,
                body: { handler: "template.details" },
            });
            expect(mocks.authenticateToken).not.toHaveBeenCalled();
        });

        it("keeps the details of a template for the admin", async () => {
            mocks.verifyJWT.mockReturnValue({ id: "user-1" });
            owner = { id: "user-1", role: "USER" };

            const response = await call("GET", "/templates/t1", "Bearer jwt");

            expect(response.status).toBe(403);
        });

        it("refuses a token whose owner is no longer an admin", async () => {
            tokenWith("templates:read");
            owner = { id: "admin-1", role: "USER" };

            const response = await call("GET", "/templates", "Bearer sit_abc");

            expect(response.status).toBe(401);
            expect(response.body.code).toBe("SERVICE_TOKEN_OWNER_INVALID");
        });

        it("refuses nobody at all", async () => {
            expect((await call("GET", "/templates")).status).toBe(401);
        });
    });

    describe("template writes with templates:write", () => {
        it.each(TEMPLATE_WRITE_ROUTES)(
            "lets a token through %s %s",
            async (method, route, handler) => {
                tokenWith("templates:write");

                const response = await call(method, route, "Bearer sit_abc");

                expect(response).toEqual({ status: 200, body: { handler } });
            }
        );

        it.each(TEMPLATE_WRITE_ROUTES)(
            "refuses a read scope on %s %s",
            async (method, route) => {
                tokenWith("templates:read", "library:write");

                const response = await call(method, route, "Bearer sit_abc");

                expect(response.status).toBe(403);
                expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
            }
        );

        it.each(TEMPLATE_WRITE_ROUTES)(
            "keeps the admin check for a session on %s %s",
            async (method, route) => {
                mocks.verifyJWT.mockReturnValue({ id: "user-1" });
                owner = { id: "user-1", role: "USER" };

                const response = await call(method, route, "Bearer jwt");

                expect(response.status).toBe(403);
            }
        );

        it("refuses a write scope on the read routes", async () => {
            tokenWith("templates:write");

            expect(
                (await call("GET", "/templates", "Bearer sit_abc")).status
            ).toBe(403);
        });

        it.each([
            ["PATCH", "/templates/t1"],
            ["POST", "/templates/t1/retire"],
            ["DELETE", "/templates/t1"],
        ])(
            "passes %s %s on to the session-only router",
            async (method, route) => {
                tokenWith("templates:read", "templates:write");

                const response = await call(method, route, "Bearer sit_abc");

                expect(response).toEqual({
                    status: 401,
                    body: { fallthrough: true },
                });
            }
        );

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
        ])("answers 401 for %s", async (_label, error, code) => {
            mocks.authenticateToken.mockRejectedValue(error);

            const response = await call(
                "POST",
                "/templates/t1/publish",
                "Bearer sit_abc"
            );

            expect(response.status).toBe(401);
            expect(response.body.code).toBe(code);
        });
    });

    describe("library seed with library:write", () => {
        it("lets a token through", async () => {
            tokenWith("library:write");

            const response = await call(
                "POST",
                "/library/seed",
                "Bearer sit_abc"
            );

            expect(response).toEqual({
                status: 200,
                body: { handler: "library.seed" },
            });
        });

        it("refuses a token without the scope", async () => {
            tokenWith("library:read", "templates:write");

            const response = await call(
                "POST",
                "/library/seed",
                "Bearer sit_abc"
            );

            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
        });

        it("refuses a token whose owner is no longer an admin", async () => {
            tokenWith("library:write");
            owner = { id: "admin-1", role: "USER" };

            const response = await call(
                "POST",
                "/library/seed",
                "Bearer sit_abc"
            );

            expect(response.status).toBe(401);
            expect(response.body.code).toBe("SERVICE_TOKEN_OWNER_INVALID");
        });

        it("lets an admin session reach the seed", async () => {
            mocks.verifyJWT.mockReturnValue({ id: "admin-1" });

            const response = await call("POST", "/library/seed", "Bearer jwt");

            expect(response).toEqual({
                status: 200,
                body: { handler: "library.seed" },
            });
            expect(mocks.authenticateToken).not.toHaveBeenCalled();
        });

        it("keeps the admin check for a session", async () => {
            mocks.verifyJWT.mockReturnValue({ id: "user-1" });
            owner = { id: "user-1", role: "USER" };

            expect(
                (await call("POST", "/library/seed", "Bearer jwt")).status
            ).toBe(403);
        });

        it("passes the other library writes on to the session router", async () => {
            tokenWith("library:write");

            const response = await call(
                "POST",
                "/library/tilesets",
                "Bearer sit_abc"
            );

            expect(response).toEqual({
                status: 401,
                body: { fallthrough: true },
            });
        });
    });
});
