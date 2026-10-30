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

// The acceptance criterion of the remote commands: with a service token, the
// CLI validates and applies a map spec end to end, through the real Express
// API (in this process, on an ephemeral port) and a real Postgres, and the
// real fetch transport. Off unless INTEGRATION_DATABASE_URL points at a
// throwaway, migrated database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const EMAIL = "cli-remote-admin@example.com";
const API_APP_PATH = path.resolve(__dirname, "../../../api/src/app");

const SPEC = (x: number): string => `kind: map
sizeTier: XS
objects:
  - { asset: plant, x: ${x}, y: ${x} }
spawns:
  - { x: 1, y: 1 }
`;

describe.skipIf(!enabled)(
    "cli remote commands (real API, real database)",
    () => {
        const workDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "standin-cli-remote-")
        );
        const originalCwd = process.cwd();
        const env: CliEnv = {
            INIT_CWD: workDir,
            XDG_CONFIG_HOME: path.join(workDir, "xdg"),
        };
        // Everything the CLI printed, except the one result that shows the token.
        const printed: string[] = [];
        let server: http.Server;
        let baseUrl: string;
        let mapId: string;
        let secret = "";

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

        const render = async () => {
            const response = await fetch(`${baseUrl}/maps/${mapId}/render`, {
                headers: { authorization: `Bearer ${secret}` },
            });
            expect(response.status).toBe(200);
            return (await response.json()) as {
                map: { layoutVersion: number };
                placed: unknown[];
            };
        };

        beforeAll(async () => {
            process.env.DATABASE_URL = url;
            process.env.JWT_SECRET = "integration-secret";
            process.env.FRONTEND_URL = "http://localhost:5173";
            process.env.SERVER_URL = "http://localhost:3000";
            process.env.STORAGE_DRIVER = "local";
            // The local storage writes under the working directory.
            process.chdir(workDir);
            fs.writeFileSync(path.join(workDir, "office.yaml"), SPEC(3));
            fs.writeFileSync(path.join(workDir, "second.yaml"), SPEC(6));

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
            fs.rmSync(workDir, { recursive: true, force: true });
        });

        it("prepares the instance: bootstrap, seed and a map", async () => {
            const boot = await run(
                ["bootstrap", "--email", EMAIL, "--json"],
                true
            );
            expect(boot.code).toBe(0);
            const { adminId, organizationId } = JSON.parse(boot.out).result;

            const seed = await run(["seed", "library", "--json"]);
            expect(seed.code).toBe(0);

            const core = await import("@standin/core");
            const space = await core.SpaceService.create(
                organizationId,
                adminId,
                {
                    name: "CLI remote",
                    sizeTier: "XS",
                }
            );
            mapId = space.mapId;
            expect(mapId).toBeTruthy();
        });

        it("creates a token on the server and logs in with it", async () => {
            const created = await run(
                [
                    "token",
                    "create",
                    "--name",
                    "e2e",
                    "--scope",
                    "maps:read",
                    "maps:write",
                    "library:read",
                    "--json",
                ],
                true
            );
            expect(created.code).toBe(0);
            secret = JSON.parse(created.out).result.token;
            expect(created.out.split(secret)).toHaveLength(2);

            const login = await run([
                "login",
                "--url",
                baseUrl,
                "--token",
                secret,
                "--json",
            ]);
            expect(login.code).toBe(0);
            const file = path.join(
                env.XDG_CONFIG_HOME ?? "",
                "standin",
                "config.json"
            );
            expect(fs.statSync(file).mode & 0o777).toBe(0o600);
        });

        it("prints a schema and lists the library with the saved login", async () => {
            const schema = await run(["schema", "print", "spec", "--json"]);
            expect(schema.code).toBe(0);

            const list = await run(["library", "list", "--json"]);
            expect(list.code).toBe(0);
            const { result } = JSON.parse(list.out);
            expect(result.assets.map((a: { key: string }) => a.key)).toContain(
                "plant"
            );
            expect(result.tilesets.length).toBeGreaterThan(0);
        });

        let before: { version: number; placed: number };

        it("validates and dry-runs without changing the map", async () => {
            const initial = await render();
            before = {
                version: initial.map.layoutVersion,
                placed: initial.placed.length,
            };

            const validate = await run([
                "map",
                "validate",
                "office.yaml",
                "--map",
                mapId,
                "--json",
            ]);
            expect(validate.code).toBe(0);
            expect(JSON.parse(validate.out).result.opCount).toBeGreaterThan(0);

            const dry = await run([
                "map",
                "apply",
                "office.yaml",
                "--map",
                mapId,
                "--dry-run",
                "--json",
            ]);
            expect(dry.code).toBe(0);
            expect(JSON.parse(dry.out).result).toMatchObject({
                dryRun: true,
                valid: true,
            });

            const after = await render();
            expect(after.map.layoutVersion).toBe(before.version);
            expect(after.placed).toHaveLength(before.placed);
        });

        it("applies the spec: the version advances and the objects exist", async () => {
            const applied = await run([
                "map",
                "apply",
                "office.yaml",
                "--map",
                mapId,
                "--json",
            ]);
            expect(applied.code).toBe(0);
            const { result } = JSON.parse(applied.out);
            expect(result.dryRun).toBe(false);
            expect(result.version).toBeGreaterThan(before.version);

            const after = await render();
            expect(after.map.layoutVersion).toBe(result.version);
            expect(after.placed.length).toBeGreaterThan(before.placed);
        });

        it("answers a stale --base-version with a conflict (exit 6)", async () => {
            const stale = await run([
                "map",
                "apply",
                "second.yaml",
                "--map",
                mapId,
                "--base-version",
                String(before.version),
                "--json",
            ]);

            expect(stale.code).toBe(6);
            const { error } = JSON.parse(stale.out);
            expect(error.code).toBe("STALE_LAYOUT_VERSION");
            expect(error.details.version).toBeGreaterThan(before.version);
        });

        it("stops working once the token is revoked (exit 4)", async () => {
            const list = await run(["token", "list", "--json"]);
            const [{ id }] = JSON.parse(list.out).result.tokens;

            const revoked = await run(["token", "revoke", id, "--json"]);
            expect(revoked.code).toBe(0);

            const denied = await run([
                "map",
                "validate",
                "office.yaml",
                "--map",
                mapId,
                "--json",
            ]);
            expect(denied.code).toBe(4);
            expect(JSON.parse(denied.out).error.code).toBe(
                "SERVICE_TOKEN_REVOKED"
            );
        });

        it("never printed the token anywhere else", () => {
            expect(secret).not.toBe("");
            expect(printed.join("\n")).not.toContain(secret);
        });
    }
);
