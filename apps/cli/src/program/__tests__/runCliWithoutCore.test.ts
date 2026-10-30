import { describe, expect, it, vi } from "vitest";
import { EXIT_CODES } from "../../consts/exitCodes";
import { createLazyServices } from "../../services/createLazyServices";
import { createFakeRuntime } from "../../testing/createFakeRuntime";
import {
    MAP_ID,
    VALID_SPEC,
    buildPalette,
    buildRender,
} from "../../testing/mapFixtures";
import {
    SEED_DRY_ANSWER,
    buildContentFiles,
} from "../../testing/contentFixtures";
import { REMOTE_ENV } from "../../testing/runCliFake";
import type { FakeOptions } from "../../types";
import type { CliRuntime } from "../../types";
import { runCli } from "../runCli";

const loads = vi.hoisted(() => {
    class CoreLoadedError extends Error {}
    return { count: 0, CoreLoadedError };
});

// Loading the core needs DATABASE_URL and SERVER_URL; here it always fails,
// so a command that reaches it would show.
vi.mock("@standin/core", () => {
    loads.count += 1;
    throw new loads.CoreLoadedError("the core must not load");
});

const SPEC_PATH = "/specs/office.yaml";

const build = (options: FakeOptions = {}) => {
    const fake = createFakeRuntime(options);
    const runtime: CliRuntime = {
        ...fake.runtime,
        services: createLazyServices(),
    };
    return { runtime, written: fake.written };
};

describe("runCli without the core", () => {
    it("shows every help without loading the core", async () => {
        for (const argv of [
            ["--help"],
            ["bootstrap", "--help"],
            ["seed", "library", "--help"],
            ["health", "--help"],
            ["token", "--help"],
            ["token", "create", "--help"],
            ["token", "list", "--help"],
            ["token", "revoke", "--help"],
            ["login", "--help"],
            ["logout", "--help"],
            ["map", "--help"],
            ["map", "validate", "--help"],
            ["map", "apply", "--help"],
            ["library", "list", "--help"],
            ["template", "--help"],
            ["template", "create", "--help"],
            ["template", "get", "--help"],
            ["template", "list", "--help"],
            ["template", "publish", "--help"],
            ["content", "--help"],
            ["content", "validate", "--help"],
            ["content", "apply", "--help"],
            ["schema", "print", "--help"],
        ]) {
            const { runtime } = build();
            await expect(runCli(argv, runtime)).resolves.toBe(EXIT_CODES.OK);
        }
        expect(loads.count).toBe(0);
    });

    it("answers usage errors without loading the core", async () => {
        const { runtime, written } = build();
        await expect(runCli(["bootstrap", "--json"], runtime)).resolves.toBe(
            EXIT_CODES.USAGE
        );
        expect(JSON.parse(written.out).error.code).toBe("CLI_MISSING_OPTION");
        expect(loads.count).toBe(0);
    });

    it("runs the remote commands without loading the core", async () => {
        const options: FakeOptions = {
            env: REMOTE_ENV,
            files: { [SPEC_PATH]: VALID_SPEC, ...buildContentFiles() },
            routes: {
                [`GET /maps/${MAP_ID}/render`]: {
                    status: 200,
                    body: buildRender(),
                },
                [`GET /maps/${MAP_ID}/library`]: {
                    status: 200,
                    body: { library: buildPalette() },
                },
                [`POST /maps/${MAP_ID}/apply`]: {
                    status: 200,
                    body: { valid: true },
                },
                "GET /library/overview": {
                    status: 200,
                    body: { groups: [], total: 0 },
                },
                "GET /library/tilesets": {
                    status: 200,
                    body: { tilesets: [], total: 0, facets: {} },
                },
                "GET /library/assets?page=1&pageSize=100": {
                    status: 200,
                    body: {
                        families: [],
                        page: 1,
                        pageSize: 100,
                        total: 0,
                        totalPages: 1,
                    },
                },
                "GET /library/areas": {
                    status: 200,
                    body: { areas: [], total: 0 },
                },
                "GET /templates": { status: 200, body: { templates: [] } },
                "POST /library/seed?dryRun=true": {
                    status: 200,
                    body: SEED_DRY_ANSWER,
                },
            },
        };
        for (const argv of [
            ["map", "validate", SPEC_PATH, "--map", MAP_ID],
            ["map", "apply", SPEC_PATH, "--map", MAP_ID, "--dry-run"],
            ["library", "list"],
            ["template", "list"],
            ["content", "validate", "/content"],
            ["content", "apply", "/content", "--dry-run"],
            ["schema", "print", "spec"],
            ["login", "--dry-run"],
            ["logout"],
        ]) {
            const { runtime } = build(options);
            await expect(runCli(argv, runtime)).resolves.toBe(EXIT_CODES.OK);
        }
        expect(loads.count).toBe(0);
    });

    it("answers a remote usage error as JSON without loading the core", async () => {
        const { runtime, written } = build();
        await expect(
            runCli(["library", "list", "--json"], runtime)
        ).resolves.toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(written.out).error.code).toBe(
            "CLI_REMOTE_URL_MISSING"
        );
        expect(loads.count).toBe(0);
    });

    it("loads the core only for a token command", async () => {
        const { runtime, written } = build();
        await expect(
            runCli(["token", "list", "--json"], runtime)
        ).resolves.toBe(EXIT_CODES.INTERNAL);
        expect(JSON.parse(written.out).ok).toBe(false);
        expect(loads.count).toBe(1);
    });
});
