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

// The worked example of the docs, `examples/authoring`, applied end to end
// through the real Express API (in this process, on an ephemeral port) and a
// real Postgres. Off unless INTEGRATION_DATABASE_URL points at a throwaway,
// migrated database different from the app's DATABASE_URL. The keys of the
// example are fixed and the uploads go to a temporary folder that is removed
// at the end, so use a fresh database for each run.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const EMAIL = "cli-example-admin@example.com";
const API_APP_PATH = path.resolve(__dirname, "../../../api/src/app");
const FOLDER = path.resolve(__dirname, "../../../../examples/authoring");
const TEMPLATE_NAME = "Small office";

describe.skipIf(!enabled)(
    "examples/authoring (real API, real database)",
    () => {
        let workDir = "";
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
        let server: http.Server;
        let baseUrl = "";

        const run = async (argv: string[]): Promise<Outcome> => {
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
            return outcome;
        };

        beforeAll(async () => {
            workDir = fs.mkdtempSync(
                path.join(os.tmpdir(), "standin-cli-example-")
            );
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
            const boot = await run(["bootstrap", "--email", EMAIL, "--json"]);
            expect(boot.code).toBe(0);

            const created = await run([
                "token",
                "create",
                "--name",
                "example",
                "--admin",
                EMAIL,
                "--scope",
                "library:read",
                "library:write",
                "maps:read",
                "maps:write",
                "templates:read",
                "templates:write",
                "--json",
            ]);
            expect(created.code).toBe(0);
            const secret: string = JSON.parse(created.out).result.token;

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

        it("validates the example on this machine", async () => {
            const validate = await run([
                "content",
                "validate",
                FOLDER,
                "--json",
            ]);

            expect(validate.code).toBe(0);
            expect(JSON.parse(validate.out).result).toMatchObject({
                valid: true,
                library: { counts: { tilesets: 2, assets: 5 } },
                templates: [{ name: TEMPLATE_NAME, thumbnail: true }],
            });
        });

        it("a dry run asks the server and writes nothing", async () => {
            const dry = await run([
                "content",
                "apply",
                FOLDER,
                "--dry-run",
                "--json",
            ]);

            expect(dry.code).toBe(0);
            expect(JSON.parse(dry.out).result.dryRun).toBe(true);
        });

        it("applies the library and the template, and a second run changes nothing", async () => {
            const first = await run(["content", "apply", FOLDER, "--json"]);
            expect(first.code).toBe(0);

            const library = await run(["library", "list", "--json"]);
            expect(library.code).toBe(0);
            expect(library.out).toContain("example-door");
            expect(library.out).toContain("example-brick");

            const again = await run(["content", "apply", FOLDER, "--json"]);
            expect(again.code).toBe(0);
            const { result } = JSON.parse(again.out);
            const entries: { action: string }[] = [
                ...result.library.result.tilesets,
                ...result.library.result.assets,
            ];
            expect(entries.length).toBeGreaterThan(0);
            for (const entry of entries) expect(entry.action).toBe("unchanged");
            expect(result.templates).toEqual([
                expect.objectContaining({
                    name: TEMPLATE_NAME,
                    action: "exists",
                }),
            ]);
        });
    }
);
