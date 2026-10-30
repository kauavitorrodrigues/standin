import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Exercises the read routes a service token may call (maps:read and
// library:read) through the real Express stack, against a real Postgres. Off
// unless INTEGRATION_DATABASE_URL points at a throwaway database different
// from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "member" | "outsider";
type Auth = { as?: UserKey; bearer?: string };

describe.skipIf(!enabled)("token read routes over HTTP (real stack)", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let db: typeof import("@standin/database").db;
    let serviceTokensTable: typeof import("@standin/database").serviceTokensTable;
    let eq: typeof import("@standin/database").eq;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;
    let organizationId: string;
    let mapId: string;
    let otherMapId: string;
    let tilesetId: string;
    let assetId: string;
    let areaId: string;

    const call = async (
        auth: Auth,
        method: string,
        route: string,
        body?: unknown
    ) => {
        const headers: Record<string, string> = {};
        if (auth.as) headers.cookie = `token=${createToken(users[auth.as])}`;
        if (auth.bearer) headers.authorization = `Bearer ${auth.bearer}`;
        if (body !== undefined) headers["content-type"] = "application/json";

        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const text = await response.text();
        let json: any = null;
        try {
            json = text ? JSON.parse(text) : null;
        } catch {
            json = text;
        }
        return { status: response.status, body: json };
    };

    // The admin issues a token, the way a tool gets one.
    const issue = async (scopes: string[]) => {
        const response = await call(
            { as: "admin" },
            "POST",
            "/service-tokens",
            { name: `read-${RUN}`, scopes }
        );
        expect(response.status).toBe(201);
        return response.body as { token: string; serviceToken: { id: string } };
    };

    const png = (width: number, height: number) =>
        core.encodePng(
            width,
            height,
            Array.from({ length: width * height }, () => [5, 5, 5, 255])
        );

    const mapReads = () => [
        `/maps/${mapId}/render`,
        `/maps/${mapId}/library`,
        `/maps/${mapId}/export`,
    ];

    const libraryReads = () => [
        "/library/overview",
        "/library/palette",
        "/library/tilesets",
        `/library/tilesets/${tilesetId}`,
        "/library/assets",
        "/library/assets/facets",
        `/library/assets/${assetId}`,
        "/library/areas",
        `/library/areas/${areaId}`,
    ];

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        process.chdir(storageDir);

        core = await import("@standin/core");
        const database = await import("@standin/database");
        const { createApp } = await import("@/app");
        ({ createToken } =
            (await import("@/features/auth/services/createToken")) as never);

        const { usersTable, organizationMembersTable } = database;
        ({ db, serviceTokensTable, eq } = database);

        const make = async (key: UserKey, role: Role) => {
            const [row] = await db
                .insert(usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@tokenread.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("member", "USER");
        await make("outsider", "USER");

        const organization = await core.OrganizationService.create(
            users.admin.id,
            { name: "Token Read Org" }
        );
        organizationId = organization.id;
        await db.insert(organizationMembersTable).values({
            userId: users.member.id,
            organizationId,
            role: "MEMBER",
        });

        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: users.admin.id }
        );
        const asset = await core.AssetService.createAsset(
            { buffer: png(32, 32) },
            {
                key: `chair-${RUN}`,
                name: "chair",
                type: "CHAIR",
                category: "ROOM_DECOR",
                footprint: { w: 1, h: 1 },
            },
            { organizationId: null, createdBy: users.admin.id }
        );
        assetId = asset.id;

        const space = await core.SpaceService.create(
            organizationId,
            users.admin.id,
            { name: `Read ${RUN}`, sizeTier: "XS" }
        );
        mapId = space.mapId;

        // A map of another organization, which the admin owns nothing of.
        const stranger = await core.OrganizationService.create(
            users.outsider.id,
            { name: "Stranger Org" }
        );
        const strangerSpace = await core.SpaceService.create(
            stranger.id,
            users.outsider.id,
            { name: `Stranger ${RUN}`, sizeTier: "XS" }
        );
        otherMapId = strangerSpace.mapId;

        server = http.createServer(createApp());
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

        const tilesets = await call(
            { as: "admin" },
            "GET",
            "/library/tilesets"
        );
        tilesetId = tilesets.body.tilesets[0].id;

        // A small area made of a floor tile, to read it back by id.
        const floors = (
            await db
                .select()
                .from(database.tilesetsTable)
                .where(database.isNull(database.tilesetsTable.organizationId))
        ).find(({ key }) => key === "floors")!;
        const floorTileIndex = Number(
            Object.entries(floors.tileMeta ?? {}).find(
                ([, meta]) => meta.category === "FLOOR"
            )![0]
        );
        const form = new FormData();
        form.append(
            "image",
            new Blob([new Uint8Array(png(64, 64))], { type: "image/png" }),
            "image.png"
        );
        form.append(
            "data",
            new Blob(
                [
                    JSON.stringify({
                        name: `Area ${RUN}`,
                        stamp: {
                            version: 1,
                            width: 2,
                            height: 2,
                            palette: [
                                {
                                    tilesetId: floors.id,
                                    tileIndex: floorTileIndex,
                                },
                            ],
                            layers: { ground: [1, 1, 1, 1] },
                            objects: [],
                            zone: { label: "Sala" },
                        },
                    }),
                ],
                { type: "application/json" }
            ),
            "data.json"
        );
        const created = await fetch(`${baseUrl}/library/areas`, {
            method: "POST",
            headers: { cookie: `token=${createToken(users.admin)}` },
            body: form,
        });
        expect(created.status).toBe(201);
        areaId = (await created.json()).area.id;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("maps:read", () => {
        it("reads the render, the palette and the export of a map", async () => {
            const { token } = await issue(["maps:read"]);

            for (const route of mapReads()) {
                const response = await call({ bearer: token }, "GET", route);
                expect(response.status, route).toBe(200);
            }
        });

        it("gives the same render as a session", async () => {
            const { token } = await issue(["maps:read"]);

            const viaToken = await call(
                { bearer: token },
                "GET",
                `/maps/${mapId}/render`
            );
            const viaSession = await call(
                { as: "admin" },
                "GET",
                `/maps/${mapId}/render`
            );

            expect(viaToken.status).toBe(200);
            expect(viaSession.status).toBe(200);
            expect(viaToken.body).toEqual(viaSession.body);
        });

        it("refuses a token with another scope, even the write one", async () => {
            const { token } = await issue([
                "maps:write",
                "library:read",
                "templates:read",
            ]);

            for (const route of mapReads()) {
                const response = await call({ bearer: token }, "GET", route);
                expect(response.status, route).toBe(403);
                expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
            }
        });

        it("keeps the map access check: a map the owner cannot see is missing", async () => {
            const { token } = await issue(["maps:read"]);

            const response = await call(
                { bearer: token },
                "GET",
                `/maps/${otherMapId}/render`
            );

            expect(response.status).toBe(404);
        });

        it("still serves the sessions that could read before", async () => {
            for (const as of ["admin", "member"] as const) {
                for (const route of mapReads()) {
                    const response = await call({ as }, "GET", route);
                    expect(response.status, `${as} ${route}`).toBe(200);
                }
            }
            const outsider = await call(
                { as: "outsider" },
                "GET",
                `/maps/${mapId}/render`
            );
            expect(outsider.status).toBe(404);
        });

        it("does not open the other map routes", async () => {
            const { token } = await issue(["maps:read", "maps:write"]);

            for (const [method, route] of [
                ["GET", `/maps/${mapId}/lock`],
                ["GET", `/maps/${mapId}/areas/${assetId}`],
                ["POST", `/maps/${mapId}/publish`],
                ["POST", `/maps/${mapId}/assets`],
            ]) {
                const response = await call({ bearer: token }, method, route);
                expect(response.status, route).toBe(401);
            }
        });
    });

    describe("library:read", () => {
        it("reads the global library", async () => {
            const { token } = await issue(["library:read"]);

            for (const route of libraryReads()) {
                const response = await call({ bearer: token }, "GET", route);
                expect(response.status, route).toBe(200);
            }
        });

        it("gives the same palette as an admin session", async () => {
            const { token } = await issue(["library:read"]);

            const viaToken = await call(
                { bearer: token },
                "GET",
                "/library/palette"
            );
            const viaSession = await call(
                { as: "admin" },
                "GET",
                "/library/palette"
            );

            expect(viaToken.status).toBe(200);
            expect(viaSession.status).toBe(200);
            expect(viaToken.body).toEqual(viaSession.body);
        });

        it("answers 404 for an area that does not exist", async () => {
            const { token } = await issue(["library:read"]);

            const response = await call(
                { bearer: token },
                "GET",
                `/library/areas/${crypto.randomUUID()}`
            );

            expect(response.status).toBe(404);
        });

        it("refuses a token with another scope, even the write one", async () => {
            const { token } = await issue([
                "library:write",
                "maps:read",
                "templates:read",
            ]);

            for (const route of libraryReads()) {
                const response = await call({ bearer: token }, "GET", route);
                expect(response.status, route).toBe(403);
                expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
            }
        });

        it("refuses the organization scope chosen by the client", async () => {
            const { token } = await issue(["library:read"]);

            const response = await call(
                { bearer: token },
                "GET",
                `/library/tilesets?organizationId=${organizationId}`
            );

            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SCOPE_FORBIDDEN");
        });

        it("keeps the admin rule for sessions", async () => {
            for (const route of libraryReads()) {
                const admin = await call({ as: "admin" }, "GET", route);
                const member = await call({ as: "member" }, "GET", route);
                expect(admin.status, route).toBe(200);
                expect(member.status, route).toBe(403);
            }
        });

        it("refuses a token once its owner is no longer an admin", async () => {
            const { token } = await issue(["library:read", "maps:read"]);
            const { usersTable } = await import("@standin/database");
            const { UserCache } =
                await import("@/features/auth/services/userCache");

            await db
                .update(usersTable)
                .set({ role: "USER" })
                .where(eq(usersTable.id, users.admin.id));
            UserCache.clear();
            try {
                for (const route of ["/library/overview", mapReads()[0]]) {
                    const response = await call(
                        { bearer: token },
                        "GET",
                        route
                    );
                    expect(response.status, route).toBe(401);
                    expect(response.body.code).toBe(
                        "SERVICE_TOKEN_OWNER_INVALID"
                    );
                }
            } finally {
                await db
                    .update(usersTable)
                    .set({ role: "ADMIN" })
                    .where(eq(usersTable.id, users.admin.id));
                UserCache.clear();
            }
        });

        it("does not open any write route or the avatar library", async () => {
            const { token } = await issue(["library:read", "library:write"]);

            for (const [method, route] of [
                ["POST", "/library/tilesets"],
                ["PATCH", `/library/tilesets/${tilesetId}`],
                ["PUT", `/library/tilesets/${tilesetId}/grid`],
                ["DELETE", `/library/tilesets/${tilesetId}`],
                ["POST", "/library/assets"],
                ["PATCH", `/library/assets/${assetId}`],
                ["DELETE", `/library/assets/${assetId}`],
                ["POST", "/library/areas"],
                ["GET", "/library/avatar-parts"],
                ["GET", "/library/avatar-bases"],
                ["GET", "/service-tokens"],
                ["GET", "/templates"],
            ]) {
                const response = await call({ bearer: token }, method, route);
                expect(response.status, `${method} ${route}`).toBe(401);
            }
        });
    });

    describe("revoked and expired tokens", () => {
        it("refuses a revoked token on every read route", async () => {
            const { token, serviceToken } = await issue([
                "maps:read",
                "library:read",
            ]);
            const revoked = await call(
                { as: "admin" },
                "POST",
                `/service-tokens/${serviceToken.id}/revoke`
            );
            expect(revoked.status).toBe(200);

            for (const route of [...mapReads(), ...libraryReads()]) {
                const response = await call({ bearer: token }, "GET", route);
                expect(response.status, route).toBe(401);
                expect(response.body.code).toBe("SERVICE_TOKEN_REVOKED");
            }
        });

        it("refuses an expired token", async () => {
            const { token, serviceToken } = await issue([
                "maps:read",
                "library:read",
            ]);
            await db
                .update(serviceTokensTable)
                .set({ expiresAt: new Date(Date.now() - 1000) })
                .where(eq(serviceTokensTable.id, serviceToken.id));

            for (const route of [
                `/maps/${mapId}/render`,
                "/library/overview",
            ]) {
                const response = await call({ bearer: token }, "GET", route);
                expect(response.status, route).toBe(401);
                expect(response.body.code).toBe("SERVICE_TOKEN_EXPIRED");
            }
        });

        it("refuses a bearer that is not a token at all", async () => {
            const response = await call(
                { bearer: "sit_not-a-real-token" },
                "GET",
                "/library/overview"
            );

            expect(response.status).toBe(401);
        });
    });
});
