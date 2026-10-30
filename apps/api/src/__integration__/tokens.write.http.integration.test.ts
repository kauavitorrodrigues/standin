import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Exercises the template and library seed routes a service token may call
// (templates:read, templates:write and library:write) through the real
// Express stack, against a real Postgres. Off unless INTEGRATION_DATABASE_URL
// points at a throwaway database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
// Keys that are unique in the database get a suffix, so a run can repeat on
// the same database.
const RUN = Date.now().toString(36);

type Core = typeof import("@standin/core");
type Role = "ADMIN" | "USER";
type UserKey = "admin" | "owner";
type Auth = { as?: UserKey; bearer?: string };

describe.skipIf(!enabled)("token write routes over HTTP (real stack)", () => {
    let core: Core;
    let createToken: (user: { id: string }) => string;
    let server: http.Server;
    let baseUrl: string;
    const storageDir = path.join(os.tmpdir(), "standin-integration-storage");
    fs.mkdirSync(storageDir, { recursive: true });

    const users = {} as Record<UserKey, { id: string; role: Role }>;

    const call = async (
        auth: Auth,
        method: string,
        route: string,
        body?: unknown
    ) => {
        const headers: Record<string, string> = {};
        if (auth.as) headers.cookie = `token=${createToken(users[auth.as])}`;
        if (auth.bearer) headers.authorization = `Bearer ${auth.bearer}`;
        const isForm = body instanceof FormData;
        if (body !== undefined && !isForm) {
            headers["content-type"] = "application/json";
        }

        const response = await fetch(`${baseUrl}${route}`, {
            method,
            headers,
            body:
                body === undefined || isForm
                    ? (body as FormData | undefined)
                    : JSON.stringify(body),
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

    const issue = async (scopes: string[]) => {
        const response = await call(
            { as: "admin" },
            "POST",
            "/service-tokens",
            { name: `write-${RUN}`, scopes }
        );
        expect(response.status).toBe(201);
        return (response.body as { token: string }).token;
    };

    const png = (width: number, height: number) =>
        core.encodePng(
            width,
            height,
            Array.from({ length: width * height }, () => [5, 5, 5, 255])
        );

    const seedForm = (library: object, files: Record<string, Buffer>) => {
        const form = new FormData();
        form.append("library", JSON.stringify(library));
        for (const [name, buffer] of Object.entries(files)) {
            form.append(
                name,
                new Blob([new Uint8Array(buffer)], { type: "image/png" }),
                path.basename(name)
            );
        }
        return form;
    };

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

        const make = async (key: UserKey, role: Role) => {
            const [row] = await database.db
                .insert(database.usersTable)
                .values({
                    name: key,
                    email: `${key}-${RUN}@tokenwrite.dev`,
                    password: "x",
                    role,
                })
                .returning({ id: database.usersTable.id });
            users[key] = { id: row.id, role };
        };
        await make("admin", "ADMIN");
        await make("owner", "USER");
        await core.OrganizationService.create(users.owner.id, {
            name: `Token Write Org ${RUN}`,
        });

        server = http.createServer(createApp());
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(async () => {
        await new Promise((resolve) => server?.close(resolve));
    });

    describe("templates", () => {
        it("creates, reads and sets the thumbnail with the right scopes", async () => {
            const writer = await issue(["templates:write"]);
            const reader = await issue(["templates:read"]);

            const created = await call(
                { bearer: writer },
                "POST",
                "/templates",
                { name: `Token Template ${RUN}`, sizeTier: "XS" }
            );
            expect(created.status).toBe(201);
            const templateId: string = created.body.templateId;

            const thumbnail = new FormData();
            thumbnail.append(
                "thumbnail",
                new Blob([new Uint8Array(png(60, 40))], { type: "image/png" }),
                "thumb.png"
            );
            expect(
                (
                    await call(
                        { bearer: writer },
                        "PUT",
                        `/templates/${templateId}/thumbnail`,
                        thumbnail
                    )
                ).status
            ).toBe(200);

            const list = await call({ bearer: reader }, "GET", "/templates");
            expect(list.status).toBe(200);
            const details = await call(
                { bearer: reader },
                "GET",
                `/templates/${templateId}`
            );
            expect(details.status).toBe(200);

            // Each scope reaches only its own routes.
            expect(
                (
                    await call({ bearer: reader }, "POST", "/templates", {
                        name: "x",
                        sizeTier: "XS",
                    })
                ).status
            ).toBe(403);
            expect(
                (await call({ bearer: writer }, "GET", "/templates")).status
            ).toBe(403);

            // Update, retire and delete stay session-only.
            for (const [method, route] of [
                ["PATCH", `/templates/${templateId}`],
                ["POST", `/templates/${templateId}/retire`],
                ["DELETE", `/templates/${templateId}`],
            ]) {
                const response = await call(
                    { bearer: writer },
                    method,
                    route,
                    {}
                );
                expect(response.status, route).toBe(401);
            }

            await call({ as: "admin" }, "DELETE", `/templates/${templateId}`);
        });

        it("keeps the catalog of an owner who is not an admin", async () => {
            const list = await call({ as: "owner" }, "GET", "/templates");

            expect(list.status).toBe(200);
        });
    });

    describe("library seed", () => {
        const library = (key: string) => ({
            tilesets: [
                { key, name: "Token floor", file: "tilesets/floor.png" },
            ],
        });

        it("validates on a dry run without writing, then seeds", async () => {
            const token = await issue(["library:write"]);
            const key = `token-floor-${RUN}`;
            const files = { "tilesets/floor.png": png(32, 32) };

            const dry = await call(
                { bearer: token },
                "POST",
                "/library/seed?dryRun=true",
                seedForm(library(key), files)
            );
            expect(dry.status).toBe(200);
            expect(dry.body).toMatchObject({
                dryRun: true,
                counts: { tilesets: 1 },
            });

            const seeded = await call(
                { bearer: token },
                "POST",
                "/library/seed",
                seedForm(library(key), files)
            );
            expect(seeded.status).toBe(200);
            expect(seeded.body.tilesets[0]).toMatchObject({
                key,
                action: "create",
            });

            const again = await call(
                { bearer: token },
                "POST",
                "/library/seed",
                seedForm(library(key), files)
            );
            expect(again.body.tilesets[0].action).toBe("unchanged");
        });

        it("answers 400 listing the PNGs the upload lacks", async () => {
            const token = await issue(["library:write"]);

            const response = await call(
                { bearer: token },
                "POST",
                "/library/seed",
                seedForm(library(`missing-${RUN}`), {})
            );

            expect(response.status).toBe(400);
            expect(response.body.code).toBe("LIBRARY_SEED_FILES_MISSING");
        });

        it("refuses a token without the scope and a non-admin session", async () => {
            const reader = await issue(["library:read"]);

            expect(
                (
                    await call(
                        { bearer: reader },
                        "POST",
                        "/library/seed",
                        seedForm({}, {})
                    )
                ).status
            ).toBe(403);
            expect(
                (
                    await call(
                        { as: "owner" },
                        "POST",
                        "/library/seed",
                        seedForm({}, {})
                    )
                ).status
            ).toBe(403);
        });
    });
});
