import http from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Exercises the service tokens over the real Express stack against a real
// Postgres: the admin routes, and a small router that uses
// `RequiresAuth.scoped`. Off unless INTEGRATION_DATABASE_URL points at a
// throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const RUN = Date.now().toString(36);

type Role = "ADMIN" | "USER";
type UserKey = "admin" | "member";
type Json = any;

describe.skipIf(!enabled)("service tokens over HTTP", () => {
    let createToken: (user: { id: string }) => string;
    let db: typeof import("@standin/database").db;
    let serviceTokensTable: typeof import("@standin/database").serviceTokensTable;
    let eq: typeof import("@standin/database").eq;
    let appServer: http.Server;
    let scopedServer: http.Server;
    let appUrl: string;
    let scopedUrl: string;

    const users = {} as Record<UserKey, { id: string; role: Role }>;

    const call = async (
        base: string,
        method: string,
        route: string,
        auth: { as?: UserKey; bearer?: string } = {},
        body?: unknown
    ) => {
        const headers: Record<string, string> = {};
        if (auth.as) headers.cookie = `token=${createToken(users[auth.as])}`;
        if (auth.bearer) headers.authorization = `Bearer ${auth.bearer}`;
        if (body !== undefined) headers["content-type"] = "application/json";

        const response = await fetch(`${base}${route}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const text = await response.text();
        const json: Json = text ? JSON.parse(text) : null;
        return { status: response.status, body: json };
    };

    const callApp = (
        method: string,
        route: string,
        auth?: { as?: UserKey; bearer?: string },
        body?: unknown
    ) => call(appUrl, method, route, auth, body);
    const callScoped = (route: string, bearer?: string) =>
        call(scopedUrl, "GET", route, { bearer });

    const issue = async (scopes: string[], extra: object = {}) => {
        const response = await callApp(
            "POST",
            "/service-tokens",
            { as: "admin" },
            { name: `token-${RUN}`, scopes, ...extra }
        );
        expect(response.status).toBe(201);
        return response.body as { token: string; serviceToken: Json };
    };

    const listen = async (server: http.Server) => {
        await new Promise<void>((resolve) =>
            server.listen(0, "127.0.0.1", resolve)
        );
        return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    };

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";

        const database = await import("@standin/database");
        ({ db, serviceTokensTable, eq } = database);
        const { createApp } = await import("@/app");
        const { RequiresAuth } = await import("@/middlewares/requiresAuth");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(database.usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@service-tokens.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: database.usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("member", "USER");

        appServer = http.createServer(createApp());
        appUrl = await listen(appServer);

        const scoped = express();
        const whoami = (req: any, res: any) => res.json({ id: req.user.id });
        scoped.get("/session-only", RequiresAuth, whoami);
        scoped.get("/maps", RequiresAuth.scoped("maps:write"), whoami);
        scoped.get("/library", RequiresAuth.scoped("library:write"), whoami);
        scopedServer = http.createServer(scoped);
        scopedUrl = await listen(scopedServer);
    });

    afterAll(async () => {
        await new Promise((resolve) => appServer?.close(resolve));
        await new Promise((resolve) => scopedServer?.close(resolve));
    });

    describe("who can manage tokens", () => {
        it("lets only an admin session create, list and revoke", async () => {
            const body = { name: "x", scopes: ["maps:write"] };

            expect(
                (await callApp("POST", "/service-tokens", {}, body)).status
            ).toBe(401);
            expect(
                (await callApp("POST", "/service-tokens", { as: "member" }, body))
                    .status
            ).toBe(403);
            expect(
                (await callApp("GET", "/service-tokens", { as: "member" })).status
            ).toBe(403);
        });

        it("refuses a service token on the token routes", async () => {
            const { token } = await issue(["maps:write", "library:write"]);

            const response = await callApp("GET", "/service-tokens", {
                bearer: token,
            });

            expect(response.status).toBe(401);
        });
    });

    describe("create and list", () => {
        it("shows the token once and never lists the hash", async () => {
            const { token, serviceToken } = await issue(["maps:write"]);

            expect(token).toMatch(/^sit_/);
            expect(serviceToken).toMatchObject({
                name: `token-${RUN}`,
                scopes: ["maps:write"],
                createdById: users.admin.id,
                tokenPrefix: token.slice(0, 12),
                revokedAt: null,
            });

            const list = await callApp("GET", "/service-tokens", { as: "admin" });
            const text = JSON.stringify(list.body);
            expect(list.status).toBe(200);
            expect(text).toContain(serviceToken.id);
            expect(text).not.toContain(token);
            expect(text).not.toContain("tokenHash");

            const [stored] = await db
                .select()
                .from(serviceTokensTable)
                .where(eq(serviceTokensTable.id, serviceToken.id));
            expect(stored.tokenHash).not.toContain(token);
        });

        it.each([
            ["no scopes", { scopes: [] }],
            ["an unknown scope", { scopes: ["tokens:admin"] }],
            ["a past expiry", { scopes: ["maps:write"], expiresAt: "2020-01-01T00:00:00.000Z" }],
        ])("refuses %s", async (_label, body) => {
            const response = await callApp(
                "POST",
                "/service-tokens",
                { as: "admin" },
                { name: "x", ...body }
            );

            expect(response.status).toBe(400);
        });
    });

    describe("scoped routes", () => {
        it("acts as the admin who created the token", async () => {
            const { token } = await issue(["maps:write"]);

            const response = await callScoped("/maps", token);

            expect(response).toEqual({
                status: 200,
                body: { id: users.admin.id },
            });
        });

        it("updates lastUsedAt", async () => {
            const { token, serviceToken } = await issue(["maps:write"]);

            await callScoped("/maps", token);

            const [stored] = await db
                .select()
                .from(serviceTokensTable)
                .where(eq(serviceTokensTable.id, serviceToken.id));
            expect(stored.lastUsedAt).toBeInstanceOf(Date);
        });

        it("rejects a token without the scope with 403", async () => {
            const { token } = await issue(["maps:write"]);

            const response = await callScoped("/library", token);

            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
        });

        it("rejects a service token on a session-only route", async () => {
            const { token } = await issue(["maps:write"]);

            expect((await callScoped("/session-only", token)).status).toBe(401);
        });

        it("rejects an unknown token with 401", async () => {
            expect((await callScoped("/maps", "sit_nope")).status).toBe(401);
        });

        it("rejects an expired token with 401", async () => {
            const { token, serviceToken } = await issue(["maps:write"]);
            await db
                .update(serviceTokensTable)
                .set({ expiresAt: new Date(Date.now() - 1000) })
                .where(eq(serviceTokensTable.id, serviceToken.id));

            const response = await callScoped("/maps", token);

            expect(response.status).toBe(401);
            expect(response.body.code).toBe("SERVICE_TOKEN_EXPIRED");
        });
    });

    describe("revoke", () => {
        it("rejects a revoked token with 401", async () => {
            const { token, serviceToken } = await issue(["maps:write"]);
            expect((await callScoped("/maps", token)).status).toBe(200);

            const revoked = await callApp(
                "DELETE",
                `/service-tokens/${serviceToken.id}`,
                { as: "admin" }
            );

            expect(revoked.status).toBe(200);
            expect(revoked.body.serviceToken.revokedAt).not.toBeNull();
            const response = await callScoped("/maps", token);
            expect(response.status).toBe(401);
            expect(response.body.code).toBe("SERVICE_TOKEN_REVOKED");
        });

        it("keeps the first revocation when revoked again", async () => {
            const { serviceToken } = await issue(["maps:write"]);
            const path = `/service-tokens/${serviceToken.id}`;

            const first = await callApp("DELETE", path, { as: "admin" });
            const second = await callApp("DELETE", path, { as: "admin" });

            expect(second.status).toBe(200);
            expect(second.body.serviceToken.revokedAt).toBe(
                first.body.serviceToken.revokedAt
            );
        });

        it("answers 404 for an unknown token", async () => {
            const response = await callApp(
                "DELETE",
                "/service-tokens/does-not-exist",
                { as: "admin" }
            );

            expect(response.status).toBe(404);
            expect(response.body.code).toBe("SERVICE_TOKEN_NOT_FOUND");
        });
    });
});
