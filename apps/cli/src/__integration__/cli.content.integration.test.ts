import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createFetchTransport } from "../api/createFetchTransport";
import { createFileConfigStore } from "../config/createFileConfigStore";
import { createNodeFiles } from "../config/createNodeFiles";
import { runCli } from "../program/runCli";
import { createLazyServices } from "../services/createLazyServices";
import type { CliEnv, CliRuntime, Outcome } from "../types";

// The content commands end to end, with a service token: a folder with a
// library and a template is applied through the real Express API (in this
// process, on an ephemeral port) and a real Postgres, with the real fetch
// transport. A second run changes nothing. Off unless INTEGRATION_DATABASE_URL
// points at a throwaway, migrated database different from the app's
// DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const EMAIL = "cli-content-admin@example.com";
const API_APP_PATH = path.resolve(__dirname, "../../../api/src/app");
// Keys and names are unique in the database, so a run can repeat on it.
const RUN = Date.now().toString(36);
const FLOOR_KEY = `cli-floor-${RUN}`;
const CRATE_KEY = `cli-crate-${RUN}`;
const TEMPLATE_NAME = `CLI Office ${RUN}`;

const SPEC = `kind: template
sizeTier: XS
name: ${TEMPLATE_NAME}
floors:
  - { tileset: "CLI floor", tileIndex: 0, from: { x: 1, y: 1 }, to: { x: 6, y: 6 } }
objects:
  - { asset: ${CRATE_KEY}, x: 3, y: 3 }
`;

describe.skipIf(!enabled)(
    "cli content commands (real API, real database)",
    () => {
        let workDir = "";
        let folder = "";
        const originalCwd = process.cwd();
        // What the test changes in the environment of the process.
        const ENV_NAMES = [
            "DATABASE_URL",
            "JWT_SECRET",
            "FRONTEND_URL",
            "SERVER_URL",
            "STORAGE_DRIVER",
        ];
        const originalEnv: Record<string, string | undefined> = {};
        const env: CliEnv = {};
        // Everything the CLI printed, except the one result that shows the token.
        const printed: string[] = [];
        let server: http.Server;
        let baseUrl: string;
        let secret = "";
        let templateId = "";
        let mapId = "";

        const run = async (argv: string[], quiet = false): Promise<Outcome> => {
            const outcome: Outcome = { code: 0, out: "", err: "" };
            const runtime: CliRuntime = {
                env,
                io: {
                    out: (text) => {
                        outcome.out += text;
                    },
                    err: (text) => {
                        outcome.err += text;
                    },
                    isInteractive: false,
                    ask: async () => undefined,
                },
                services: createLazyServices(),
                http: createFetchTransport(),
                config: createFileConfigStore(env),
                files: createNodeFiles(),
            };
            outcome.code = await runCli(argv, runtime);
            if (!quiet) printed.push(outcome.out, outcome.err);
            return outcome;
        };

        const listTemplates = async () => {
            const response = await fetch(`${baseUrl}/templates`, {
                headers: { authorization: `Bearer ${secret}` },
            });
            expect(response.status).toBe(200);
            const { templates } = (await response.json()) as {
                templates: { id: string; name: string; status: string }[];
            };
            return templates.filter(({ name }) => name === TEMPLATE_NAME);
        };

        beforeAll(async () => {
            workDir = fs.mkdtempSync(
                path.join(os.tmpdir(), "standin-cli-content-")
            );
            folder = path.join(workDir, "content");
            env.INIT_CWD = workDir;
            env.XDG_CONFIG_HOME = path.join(workDir, "xdg");
            for (const name of ENV_NAMES) originalEnv[name] = process.env[name];
            process.env.DATABASE_URL = url;
            process.env.JWT_SECRET = "integration-secret";
            process.env.FRONTEND_URL = "http://localhost:5173";
            process.env.SERVER_URL = "http://localhost:3000";
            process.env.STORAGE_DRIVER = "local";
            // The local storage writes under the working directory.
            process.chdir(workDir);

            // The PNGs are made by the core, so the server decodes them.
            const core = await import("@standin/core");
            const png = (width: number, height: number): Buffer =>
                core.encodePng(
                    width,
                    height,
                    Array.from({ length: width * height }, () => [5, 5, 5, 255])
                );
            fs.mkdirSync(path.join(folder, "tilesets"), { recursive: true });
            fs.mkdirSync(path.join(folder, "assets"), { recursive: true });
            fs.mkdirSync(path.join(folder, "templates"), { recursive: true });
            fs.writeFileSync(
                path.join(folder, "library.json"),
                JSON.stringify({
                    tilesets: [
                        {
                            key: FLOOR_KEY,
                            name: "CLI floor",
                            file: "tilesets/floor.png",
                            tileMeta: { "0": { category: "FLOOR" } },
                        },
                    ],
                    assets: [
                        {
                            key: CRATE_KEY,
                            name: "CLI crate",
                            type: "DECORATION",
                            category: "ROOM_DECOR",
                            footprint: { w: 1, h: 1 },
                            file: "assets/crate.png",
                        },
                    ],
                })
            );
            fs.writeFileSync(
                path.join(folder, "tilesets/floor.png"),
                png(32, 32)
            );
            fs.writeFileSync(
                path.join(folder, "assets/crate.png"),
                png(32, 32)
            );
            fs.writeFileSync(path.join(folder, "templates/office.yaml"), SPEC);
            fs.writeFileSync(
                path.join(folder, "templates/office.png"),
                png(60, 40)
            );

            // A variable path keeps the API out of the type check of this app.
            const { createApp } = await import(/* @vite-ignore */ API_APP_PATH);
            server = http.createServer(createApp());
            await new Promise<void>((resolve) =>
                server.listen(0, "127.0.0.1", resolve)
            );
            baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
        });

        afterAll(async () => {
            await new Promise((resolve) => server?.close(resolve));
            process.chdir(originalCwd);
            for (const name of ENV_NAMES) {
                if (originalEnv[name] === undefined) {
                    delete process.env[name];
                }
                if (originalEnv[name] !== undefined) {
                    process.env[name] = originalEnv[name];
                }
            }
            if (workDir) fs.rmSync(workDir, { recursive: true, force: true });
        });

        it("prepares the instance: bootstrap, a token with every scope, login", async () => {
            const boot = await run(
                ["bootstrap", "--email", EMAIL, "--json"],
                true
            );
            expect(boot.code).toBe(0);

            const created = await run(
                [
                    "token",
                    "create",
                    "--name",
                    "content",
                    "--scope",
                    "library:read",
                    "library:write",
                    "maps:read",
                    "maps:write",
                    "templates:read",
                    "templates:write",
                    "--json",
                ],
                true
            );
            expect(created.code).toBe(0);
            secret = JSON.parse(created.out).result.token;

            const login = await run([
                "login",
                "--url",
                baseUrl,
                "--token",
                secret,
                "--json",
            ]);
            expect(login.code).toBe(0);
        });

        it("validates the folder on this machine", async () => {
            const validate = await run([
                "content",
                "validate",
                folder,
                "--json",
            ]);

            expect(validate.code).toBe(0);
            expect(JSON.parse(validate.out).result).toMatchObject({
                valid: true,
                library: { files: 2, counts: { tilesets: 1, assets: 1 } },
                templates: [
                    { name: TEMPLATE_NAME, sizeTier: "XS", thumbnail: true },
                ],
            });
        });

        it("a dry run asks the server and writes nothing", async () => {
            const dry = await run([
                "content",
                "apply",
                folder,
                "--dry-run",
                "--json",
            ]);

            expect(dry.code).toBe(0);
            const { result } = JSON.parse(dry.out);
            expect(result.dryRun).toBe(true);
            expect(result.library).toMatchObject({
                dryRun: true,
                counts: { tilesets: 1, assets: 1 },
            });
            expect(result.templates).toEqual([
                expect.objectContaining({
                    name: TEMPLATE_NAME,
                    action: "would-create",
                }),
            ]);
            expect(await listTemplates()).toHaveLength(0);

            const library = await run(["library", "list", "--json"], true);
            expect(library.out).not.toContain(FLOOR_KEY);
        });

        it("applies the folder: the library, then the template", async () => {
            const applied = await run(["content", "apply", folder, "--json"]);
            expect(applied.code).toBe(0);
            const { result } = JSON.parse(applied.out);
            expect(result.library.result.tilesets[0]).toMatchObject({
                key: FLOOR_KEY,
                action: "create",
            });
            expect(result.library.result.assets[0]).toMatchObject({
                key: CRATE_KEY,
                action: "create",
            });
            expect(result.templates).toEqual([
                expect.objectContaining({
                    name: TEMPLATE_NAME,
                    action: "created",
                    status: "DRAFT",
                    thumbnailUploaded: true,
                }),
            ]);
            expect(result.templates[0].opCount).toBeGreaterThan(0);
            templateId = result.templates[0].id;
            expect(templateId).toBeTruthy();
        });

        it("a second run changes nothing", async () => {
            const again = await run(["content", "apply", folder, "--json"]);

            expect(again.code).toBe(0);
            const { result } = JSON.parse(again.out);
            expect(result.library.result.tilesets[0].action).toBe("unchanged");
            expect(result.library.result.assets[0].action).toBe("unchanged");
            expect(result.templates).toEqual([
                expect.objectContaining({
                    name: TEMPLATE_NAME,
                    action: "exists",
                    id: templateId,
                }),
            ]);
            expect(await listTemplates()).toHaveLength(1);
        });

        it("lists and reads the template", async () => {
            const list = await run([
                "template",
                "list",
                "--size-tier",
                "XS",
                "--json",
            ]);
            expect(list.code).toBe(0);
            const found = JSON.parse(list.out).result.templates.filter(
                (template: { name: string }) => template.name === TEMPLATE_NAME
            );
            expect(found).toHaveLength(1);

            const get = await run(["template", "get", templateId, "--json"]);
            expect(get.code).toBe(0);
            const { template } = JSON.parse(get.out).result;
            expect(template).toMatchObject({
                id: templateId,
                name: TEMPLATE_NAME,
                status: "DRAFT",
                sizeTier: "XS",
            });
            expect(template.thumbnailUrl).toBeTruthy();
            mapId = template.mapId;

            const render = await fetch(`${baseUrl}/maps/${mapId}/render`, {
                headers: { authorization: `Bearer ${secret}` },
            });
            const { placed } = (await render.json()) as { placed: unknown[] };
            expect(placed.length).toBeGreaterThan(0);
        });

        it("publishes the template", async () => {
            const dry = await run([
                "template",
                "publish",
                templateId,
                "--dry-run",
                "--json",
            ]);
            expect(dry.code).toBe(0);
            expect(JSON.parse(dry.out).result.template.status).toBe("DRAFT");

            const published = await run([
                "template",
                "publish",
                templateId,
                "--json",
            ]);
            expect(published.code).toBe(0);
            expect(JSON.parse(published.out).result.template.status).toBe(
                "PUBLISHED"
            );

            const again = await run([
                "content",
                "apply",
                folder,
                "--publish",
                "--json",
            ]);
            expect(again.code).toBe(0);
            expect(JSON.parse(again.out).result.templates[0].action).toBe(
                "unchanged"
            );
        });

        it("never printed the token anywhere else", () => {
            expect(secret).not.toBe("");
            expect(printed.join("\n")).not.toContain(secret);
        });
    }
);
