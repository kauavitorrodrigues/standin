import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createFakeRuntime } from "../testing/createFakeRuntime";
import type { CliRuntime, Outcome } from "../types";

// Runs bootstrap, seed library and health against a real Postgres, calling
// runCli in-process with the real services (it does not start index.ts or the
// shell script). Off unless INTEGRATION_DATABASE_URL points at a throwaway,
// migrated database different from the app's DATABASE_URL.
const url = process.env.INTEGRATION_DATABASE_URL;
const enabled = Boolean(url) && url !== process.env.DATABASE_URL;
const EMAIL = "cli-admin@example.com";

describe.skipIf(!enabled)("cli (real database)", () => {
    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "standin-cli-"));
    const originalCwd = process.cwd();
    let runCli: typeof import("../program/runCli").runCli;
    let createLazyServices: typeof import("../services/createLazyServices").createLazyServices;

    beforeAll(async () => {
        process.env.DATABASE_URL = url;
        process.env.JWT_SECRET = "integration-secret";
        process.env.FRONTEND_URL = "http://localhost:5173";
        process.env.SERVER_URL = "http://localhost:3000";
        process.env.STORAGE_DRIVER = "local";
        // The script runs from apps/api, where the API serves `public` from,
        // and the local storage writes under the working directory. This
        // folder stands in for apps/api.
        process.chdir(workDir);
        ({ runCli } = await import("../program/runCli"));
        ({ createLazyServices } =
            await import("../services/createLazyServices"));
    });

    afterAll(() => {
        process.chdir(originalCwd);
        fs.rmSync(workDir, { recursive: true, force: true });
    });

    const run = async (argv: string[]): Promise<Outcome> => {
        const outcome: Outcome = { code: 0, out: "", err: "" };
        // The remote seams are not used by these commands.
        const fake = createFakeRuntime();
        const runtime: CliRuntime = {
            env: { INIT_CWD: workDir },
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
            http: fake.runtime.http,
            config: fake.runtime.config,
            files: fake.runtime.files,
        };
        outcome.code = await runCli(argv, runtime);
        return outcome;
    };

    it("fails seeding while there is no admin", async () => {
        const seeded = await run(["seed", "library", "--json"]);
        expect(seeded.code).toBe(6);
        const { error } = JSON.parse(seeded.out);
        expect(error.code).toBe("LIBRARY_SEED_ADMIN_NOT_FOUND");
        expect(error.fix).toContain("standin bootstrap");
    });

    it("bootstraps a new instance and changes nothing the second time", async () => {
        const first = await run(["bootstrap", "--email", EMAIL, "--json"]);
        expect(first.code).toBe(0);
        const created = JSON.parse(first.out);
        expect(created.ok).toBe(true);
        expect(
            created.result.steps.map((s: { status: string }) => s.status)
        ).toEqual(["created", "created"]);
        expect(created.result.generatedPassword).toEqual(expect.any(String));

        const second = await run(["bootstrap", "--email", EMAIL, "--json"]);
        expect(second.code).toBe(0);
        const again = JSON.parse(second.out);
        expect(
            again.result.steps.map((s: { status: string }) => s.status)
        ).toEqual(["exists", "exists"]);
        expect(again.result.generatedPassword).toBeUndefined();
        expect(again.result.adminId).toBe(created.result.adminId);
    });

    it("seeds the default library, then leaves it unchanged", async () => {
        const first = await run(["seed", "library", "--json"]);
        expect(first.code).toBe(0);
        expect(JSON.parse(first.out).ok).toBe(true);

        const second = await run(["seed", "library", "--json"]);
        expect(second.code).toBe(0);
        const { result } = JSON.parse(second.out);
        const actions = Object.values(result).flatMap((items) =>
            (items as { action: string }[]).map(({ action }) => action)
        );
        expect(actions.length).toBeGreaterThan(0);
        expect(new Set(actions)).toEqual(new Set(["unchanged"]));
    });

    it("stores the seeded files where the API serves them from", () => {
        const served = path.join(workDir, "public");
        expect(fs.readdirSync(served).length).toBeGreaterThan(0);
    });

    it("seeds a library folder", async () => {
        const { encodePng } = await import("@standin/core");
        const pixels = Array.from(
            { length: 32 * 32 },
            (): [number, number, number, number] => [9, 9, 9, 255]
        );
        const folder = path.join(workDir, "library");
        fs.mkdirSync(folder);
        fs.writeFileSync(path.join(folder, "t.png"), encodePng(32, 32, pixels));
        fs.writeFileSync(path.join(folder, "a.png"), encodePng(32, 32, pixels));
        fs.writeFileSync(
            path.join(folder, "library.json"),
            JSON.stringify({
                tilesets: [
                    {
                        key: "cli-floor",
                        name: "Floor",
                        tileMeta: { "0": { category: "FLOOR" } },
                        file: "t.png",
                    },
                ],
                assets: [
                    {
                        key: "cli-chair",
                        name: "Chair",
                        type: "CHAIR",
                        footprint: { w: 1, h: 1 },
                        file: "a.png",
                    },
                ],
            })
        );

        const dry = await run([
            "seed",
            "library",
            "library",
            "--dry-run",
            "--json",
        ]);
        expect(dry.code).toBe(0);
        expect(JSON.parse(dry.out).result.keys.assets).toEqual(["cli-chair"]);

        const real = await run(["seed", "library", "library", "--json"]);
        expect(real.code).toBe(0);
        const { result } = JSON.parse(real.out);
        expect(result.tilesets).toEqual([
            expect.objectContaining({ key: "cli-floor", action: "create" }),
        ]);
        expect(result.assets).toEqual([
            expect.objectContaining({ key: "cli-chair", action: "create" }),
        ]);
    });

    it("exits 3 for a folder that is not a library", async () => {
        const broken = await run([
            "seed",
            "library",
            "missing-folder",
            "--json",
        ]);
        expect(broken.code).toBe(3);
        expect(JSON.parse(broken.out).error.code).toBe(
            "CLI_LIBRARY_FOLDER_INVALID"
        );
    });

    it("reports a healthy instance", async () => {
        const health = await run(["health", "--json"]);
        expect(health.code).toBe(0);
        expect(JSON.parse(health.out).result.status).toMatch(/ok|degraded/);
    });
});
