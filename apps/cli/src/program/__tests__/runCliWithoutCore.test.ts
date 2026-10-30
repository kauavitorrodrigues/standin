import { describe, expect, it, vi } from "vitest";
import { EXIT_CODES } from "../../consts/exitCodes";
import { createLazyServices } from "../../services/createLazyServices";
import { createFakeRuntime } from "../../testing/createFakeRuntime";
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

const build = () => {
    const fake = createFakeRuntime();
    const runtime: CliRuntime = {
        env: {},
        io: fake.io,
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
});
