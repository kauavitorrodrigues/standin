import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { EditorOp } from "@standin/contracts";

// Exercises POST /maps/:mapId/apply through the real Express stack, against a
// real Postgres, with service tokens and with a session. Off unless
// INTEGRATION_DATABASE_URL points at a throwaway database different from the
// app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "member" | "other" | "outsider";
type Auth = { as?: UserKey; bearer?: string };

describe.skipIf(!enabled)("apply over HTTP (real stack)", () => {
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
    const defs = {} as Record<string, string>;
    let organizationId: string;
    let counter = 0;

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

    const png = (width: number, height: number) =>
        core.encodePng(
            width,
            height,
            Array.from({ length: width * height }, () => [5, 5, 5, 255])
        );

    // The admin owns the organization: a service token acts as the admin who
    // issued it. A space of its own per test, so versions and locks never leak.
    const newSpace = async () => {
        counter += 1;
        const space = await core.SpaceService.create(
            organizationId,
            users.admin.id,
            { name: `Apply ${RUN} ${counter}`, sizeTier: "XS" }
        );
        return { id: space.id, mapId: space.mapId };
    };

    // The admin issues a token, the way a tool gets one.
    const issue = async (scopes: string[] = ["maps:write"]) => {
        const response = await call(
            { as: "admin" },
            "POST",
            "/service-tokens",
            { name: `apply-${RUN}`, scopes }
        );
        expect(response.status).toBe(201);
        return response.body as { token: string; serviceToken: { id: string } };
    };

    const hold = (as: UserKey, mapId: string, session: string) => {
        const result = core.MapLockService.acquire(
            mapId,
            { id: users[as].id, name: as },
            session
        );
        expect(result.ok).toBe(true);
    };

    const apply = (
        auth: Auth,
        mapId: string,
        baseVersion: number,
        ops: EditorOp[],
        extra: object = {}
    ) =>
        call(auth, "POST", `/maps/${mapId}/apply`, {
            baseVersion,
            ops,
            ...extra,
        });

    const background = (color: string): EditorOp => ({
        type: "set_background",
        color,
    });

    const place = (tempId: string, tileX: number): EditorOp => ({
        type: "place_asset",
        tempId,
        assetId: defs.chair,
        tileX,
        tileY: 6,
    });

    const renderOf = async (mapId: string) =>
        (await call({ as: "admin" }, "GET", `/maps/${mapId}/render`)).body;

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
                    email: `${key}-${RUN}@apply.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("member", "USER");
        await make("other", "USER");
        await make("outsider", "USER");

        const organization = await core.OrganizationService.create(
            users.admin.id,
            { name: "Apply Org" }
        );
        organizationId = organization.id;
        for (const key of ["member", "other"] as const) {
            await db.insert(organizationMembersTable).values({
                userId: users[key].id,
                organizationId,
                role: "MEMBER",
            });
        }

        await core.AssetService.seed(
            { tilesets: core.DEFAULT_LIBRARY_SEED.tilesets, assets: [] },
            { createdBy: users.admin.id }
        );
        const createAsset = async (
            key: string,
            data: Partial<import("@standin/contracts").CreateAssetData>,
            size = { w: 32, h: 32 }
        ) => {
            const asset = await core.AssetService.createAsset(
                { buffer: png(size.w, size.h) },
                {
                    key: `${key}-${RUN}`,
                    name: key,
                    type: "DECORATION",
                    category: "ROOM_DECOR",
                    footprint: { w: 1, h: 1 },
                    ...data,
                },
                { organizationId: null, createdBy: users.admin.id }
            );
            defs[key] = asset.id;
        };
        await createAsset(
            "desk",
            { type: "DESK", footprint: { w: 2, h: 1 }, solid: true },
            { w: 64, h: 32 }
        );
        await createAsset("chair", { type: "CHAIR" });

        server = http.createServer(createApp());
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("with a service token", () => {
        it("applies ops and answers what a publish answers", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await apply({ bearer: token }, mapId, 1, [
                background("#123456"),
                place("tmp_chair", 6),
            ]);

            expect(response.status).toBe(200);
            expect(response.body.version).toBe(2);
            expect(typeof response.body.idMap.tmp_chair).toBe("string");
            expect(response.body.limits.objectsUsed).toBe(1);
            expect(JSON.stringify(response.body)).not.toContain("apply:");

            const render = await renderOf(mapId);
            expect(render.map.layoutVersion).toBe(2);
            expect(render.map.layout.backgroundcolor).toBe("#123456");
            expect(render.placed).toHaveLength(1);
        });

        it("gives the same result as a publish of the same ops", async () => {
            const applied = await newSpace();
            const published = await newSpace();
            const { token } = await issue();
            const ops = [background("#abcdef"), place("tmp_a", 7)];

            const viaApply = await apply(
                { bearer: token },
                applied.mapId,
                1,
                ops
            );
            const session = "s-publish";
            hold("admin", published.mapId, session);
            const response = await fetch(
                `${baseUrl}/maps/${published.mapId}/publish`,
                {
                    method: "POST",
                    headers: {
                        cookie: `token=${createToken(users.admin)}`,
                        "content-type": "application/json",
                        "x-editor-session": session,
                    },
                    body: JSON.stringify({
                        publishId: crypto.randomUUID(),
                        baseVersion: 1,
                        ops,
                    }),
                }
            );
            const viaPublish = await response.json();

            expect(viaApply.status).toBe(200);
            expect(response.status).toBe(200);
            expect(Object.keys(viaApply.body).sort()).toEqual(
                Object.keys(viaPublish).sort()
            );
            expect(viaApply.body.version).toBe(viaPublish.version);
            expect(viaApply.body.limits).toEqual(viaPublish.limits);
        });

        it("lets the lock go: the next apply and a new editor get it", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            await apply({ bearer: token }, mapId, 1, [background("#111111")]);

            expect(core.MapLockService.get(mapId)).toBeUndefined();
            const again = await apply({ bearer: token }, mapId, 2, [
                background("#222222"),
            ]);
            expect(again.status).toBe(200);
            expect(again.body.version).toBe(3);
        });

        it("lets the lock go when the ops are refused", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await apply({ bearer: token }, mapId, 1, [
                { type: "remove_asset", id: crypto.randomUUID() } as EditorOp,
            ]);

            expect(response.status).toBe(422);
            expect(core.MapLockService.get(mapId)).toBeUndefined();
        });

        it("answers 423 while an editor session holds the lock, and leaves it", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();
            hold("admin", mapId, "s-editor");

            const response = await apply({ bearer: token }, mapId, 1, [
                background("#333333"),
            ]);

            expect(response.status).toBe(423);
            expect(response.body.code).toBe("MAP_LOCKED");
            expect(response.body.by).toMatchObject({ id: users.admin.id });
            expect(core.MapLockService.get(mapId)?.sessionId).toBe("s-editor");
            expect((await renderOf(mapId)).map.layoutVersion).toBe(1);
        });

        it("answers 409 with the current version for an old baseVersion", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();
            await apply({ bearer: token }, mapId, 1, [background("#111111")]);

            const stale = await apply({ bearer: token }, mapId, 1, [
                background("#222222"),
            ]);

            expect(stale.status).toBe(409);
            expect(stale.body).toMatchObject({
                code: "STALE_LAYOUT_VERSION",
                version: 2,
            });
        });

        it("answers 422 with the issues and writes nothing", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await apply({ bearer: token }, mapId, 1, [
                background("#444444"),
                place("tmp_out", 9999),
            ]);

            expect(response.status).toBe(422);
            expect(response.body.code).toBe("PUBLISH_INVALID");
            expect(response.body.errors.length).toBeGreaterThan(0);
            expect((await renderOf(mapId)).map.layoutVersion).toBe(1);
        });

        it("answers 413 for too many ops", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();
            const ops = Array.from({ length: 5001 }, () =>
                background("#555555")
            );

            const response = await apply({ bearer: token }, mapId, 1, ops);

            expect(response.status).toBe(413);
        });

        it("answers 400 for a scope or a publishId, which only a publish takes", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await apply({ bearer: token }, mapId, 1, [], {
                scope: "map",
                publishId: crypto.randomUUID(),
            });

            expect(response.status).toBe(400);
        });

        it("reads a body bigger than the global limit, up to the publish one", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();
            const ops = Array.from({ length: 5000 }, () =>
                background("#123456")
            );
            expect(
                JSON.stringify({ baseVersion: 1, ops }).length
            ).toBeGreaterThan(100 * 1024);

            const response = await apply({ bearer: token }, mapId, 1, ops);

            expect(response.status).toBe(200);
            expect(response.body.version).toBe(2);
        });

        it("answers 413 OP_TOO_LARGE for a body over the publish limit", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await apply({ bearer: token }, mapId, 1, [], {
                padding: "x".repeat(5 * 1024 * 1024 + 1024),
            });

            expect(response.status).toBe(413);
            expect(response.body.code).toBe("OP_TOO_LARGE");
        });

        it("answers 400 for a body that is not valid", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await call(
                { bearer: token },
                "POST",
                `/maps/${mapId}/apply`,
                { baseVersion: 0, ops: [] }
            );

            expect(response.status).toBe(400);
        });

        it("answers 404 for a map that does not exist", async () => {
            const { token } = await issue();

            const response = await apply(
                { bearer: token },
                crypto.randomUUID(),
                1,
                []
            );

            expect(response.status).toBe(404);
        });
    });

    describe("validateOnly", () => {
        it("answers valid, writes nothing and takes no lock", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await apply(
                { bearer: token },
                mapId,
                1,
                [background("#666666"), place("tmp_v", 8)],
                { validateOnly: true }
            );

            expect(response).toEqual({ status: 200, body: { valid: true } });
            expect(core.MapLockService.get(mapId)).toBeUndefined();
            const render = await renderOf(mapId);
            expect(render.map.layoutVersion).toBe(1);
            expect(render.placed).toHaveLength(0);
        });

        it("gives the issues of the publish for ops that do not apply", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();
            const ops = [place("tmp_out", 9999)];

            const dry = await apply({ bearer: token }, mapId, 1, ops, {
                validateOnly: true,
            });
            const real = await apply({ bearer: token }, mapId, 1, ops);

            expect(dry.status).toBe(422);
            expect(dry.body).toEqual(real.body);
        });

        it("still checks the base version", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await apply(
                { bearer: token },
                mapId,
                7,
                [background("#777777")],
                { validateOnly: true }
            );

            expect(response.status).toBe(409);
            expect(response.body.code).toBe("STALE_LAYOUT_VERSION");
        });

        it("is refused with 423 like the real call while an editor holds the lock", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();
            hold("admin", mapId, "s-editor");

            const response = await apply(
                { bearer: token },
                mapId,
                1,
                [background("#888888")],
                { validateOnly: true }
            );

            expect(response.status).toBe(423);
            expect(response.body.code).toBe("MAP_LOCKED");
            expect(core.MapLockService.get(mapId)?.sessionId).toBe("s-editor");
        });
    });

    describe("who may apply", () => {
        it("accepts a session of someone who can edit the map", async () => {
            const { mapId } = await newSpace();

            const response = await apply({ as: "admin" }, mapId, 1, [
                background("#999999"),
            ]);

            expect(response.status).toBe(200);
            expect(response.body.version).toBe(2);
        });

        it("refuses a session that can read but not edit with 403", async () => {
            const { mapId } = await newSpace();

            const response = await apply({ as: "member" }, mapId, 1, [
                background("#999999"),
            ]);

            expect(response.status).toBe(403);
            expect((await renderOf(mapId)).map.layoutVersion).toBe(1);
        });

        it("answers 404 for someone who cannot see the map", async () => {
            const { mapId } = await newSpace();

            const response = await apply({ as: "outsider" }, mapId, 1, []);

            expect(response.status).toBe(404);
        });

        it("refuses a request with no credentials", async () => {
            const { mapId } = await newSpace();

            expect((await apply({}, mapId, 1, [])).status).toBe(401);
        });

        it("refuses a token without the scope with 403", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue(["library:write"]);

            const response = await apply({ bearer: token }, mapId, 1, [
                background("#aaaaaa"),
            ]);

            expect(response.status).toBe(403);
            expect(response.body.code).toBe("SERVICE_TOKEN_SCOPE_MISSING");
        });

        it("refuses a revoked token with 401", async () => {
            const { mapId } = await newSpace();
            const { token, serviceToken } = await issue();
            await call(
                { as: "admin" },
                "DELETE",
                `/service-tokens/${serviceToken.id}`
            );

            const response = await apply({ bearer: token }, mapId, 1, []);

            expect(response.status).toBe(401);
            expect(response.body.code).toBe("SERVICE_TOKEN_REVOKED");
        });

        it("refuses an expired token with 401", async () => {
            const { mapId } = await newSpace();
            const { token, serviceToken } = await issue();
            await db
                .update(serviceTokensTable)
                .set({ expiresAt: new Date(Date.now() - 1000) })
                .where(eq(serviceTokensTable.id, serviceToken.id));

            const response = await apply({ bearer: token }, mapId, 1, []);

            expect(response.status).toBe(401);
            expect(response.body.code).toBe("SERVICE_TOKEN_EXPIRED");
        });
    });

    describe("what a token cannot reach", () => {
        it.each([
            ["GET", "/export"],
            ["GET", "/render"],
            ["GET", "/library"],
            ["GET", "/lock"],
        ])("refuses it on %s /maps/:mapId%s", async (method, suffix) => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await call(
                { bearer: token },
                method,
                `/maps/${mapId}${suffix}`
            );

            expect(response.status).toBe(401);
        });

        it("refuses it on publish and on the assets routes", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const publish = await call(
                { bearer: token },
                "POST",
                `/maps/${mapId}/publish`,
                { publishId: crypto.randomUUID(), baseVersion: 1, ops: [] }
            );
            const assets = await call(
                { bearer: token },
                "POST",
                `/maps/${mapId}/assets`,
                {}
            );

            expect(publish.status).toBe(401);
            expect(assets.status).toBe(401);
        });

        it("refuses it on other methods of the apply path", async () => {
            const { mapId } = await newSpace();
            const { token } = await issue();

            const response = await call(
                { bearer: token },
                "GET",
                `/maps/${mapId}/apply`
            );

            expect(response.status).toBe(401);
        });
    });
});
