import { UnexpectedFailure } from "../../testing/UnexpectedFailure";
import {
    BootstrapInputInvalidError,
    LibrarySeedAdminNotFoundError,
} from "@standin/contracts";
import { describe, expect, it, vi } from "vitest";
import { EXIT_CODES } from "../../consts/exitCodes";
import { createFakeRuntime } from "../../testing/createFakeRuntime";
import { runCli } from "../runCli";

const result = {
    steps: [{ target: "admin", status: "created", label: "admin created" }],
    adminId: "a",
    organizationId: "o",
};

describe("runCli", () => {
    it.each([
        [["--help"]],
        [["bootstrap", "--help"]],
        [["seed", "library", "--help"]],
        [["health", "--help"]],
    ])("shows help with an example for %j and exits 0", async (argv) => {
        const { runtime, written } = createFakeRuntime();
        await expect(runCli(argv, runtime)).resolves.toBe(EXIT_CODES.OK);
        expect(written.out).toContain("Examples:");
        expect(written.out).toContain("pnpm -s standin");
    });

    it("prints the success as JSON and exits 0", async () => {
        const { runtime, written } = createFakeRuntime({
            services: { bootstrapInstance: vi.fn(async () => result) as never },
        });
        const code = await runCli(
            ["bootstrap", "--email", "a@b.co", "--json"],
            runtime
        );
        expect(code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(written.out)).toEqual({
            ok: true,
            command: "bootstrap",
            result,
        });
    });

    it("accepts the global flags after the command", async () => {
        const { runtime, written } = createFakeRuntime();
        const code = await runCli(
            ["bootstrap", "--email", "a@b.co", "--dry-run", "--yes"],
            runtime
        );
        expect(code).toBe(EXIT_CODES.OK);
        expect(written.out).toContain("✓ input is valid");
    });

    it("prints human success on stdout and errors on stderr", async () => {
        const { runtime, written } = createFakeRuntime({
            services: {
                bootstrapInstance: vi.fn(async () => {
                    throw new BootstrapInputInvalidError("email: bad");
                }),
            },
        });
        const code = await runCli(["bootstrap", "--email", "x"], runtime);
        expect(code).toBe(EXIT_CODES.VALIDATION);
        expect(written.out).toBe("");
        expect(written.err).toContain("BOOTSTRAP_INPUT_INVALID");
    });

    it("answers a usage error as JSON with exit 2", async () => {
        const { runtime, written } = createFakeRuntime();
        const code = await runCli(["bootstrap", "--json"], runtime);
        expect(code).toBe(EXIT_CODES.USAGE);
        const body = JSON.parse(written.out);
        expect(body.ok).toBe(false);
        expect(body.error.code).toBe("CLI_MISSING_OPTION");
        expect(body.error.fix).toContain("ADMIN_EMAIL");
    });

    it("treats an unknown command and an unknown flag as usage errors", async () => {
        const first = createFakeRuntime();
        await expect(runCli(["nope"], first.runtime)).resolves.toBe(2);
        expect(first.written.err).toContain("CLI_USAGE");

        const second = createFakeRuntime();
        await expect(
            runCli(["health", "--nope", "--json"], second.runtime)
        ).resolves.toBe(2);
        expect(JSON.parse(second.written.out).error.code).toBe("CLI_USAGE");
    });

    it("exits 2 with no command", async () => {
        const { runtime } = createFakeRuntime();
        await expect(runCli([], runtime)).resolves.toBe(EXIT_CODES.USAGE);
    });

    it.each([[["--json"]], [["seed", "--json"]]])(
        "answers %j with one JSON failure and exit 2",
        async (argv) => {
            const { runtime, written } = createFakeRuntime();
            await expect(runCli(argv, runtime)).resolves.toBe(EXIT_CODES.USAGE);
            const body = JSON.parse(written.out);
            expect(body.ok).toBe(false);
            expect(body.error.code).toBe("CLI_USAGE");
            expect(body.error.message).toBe("a command is required.");
        }
    );

    it("does not echo the value of a mistyped option", async () => {
        const { runtime, written } = createFakeRuntime();
        await runCli(
            ["bootstrap", "--pasword=Secret-Value-1", "--json"],
            runtime
        );
        expect(written.out).not.toContain("Secret-Value-1");
    });

    it("exits 5 with a hint when the database cannot be reached", async () => {
        const refused = new UnexpectedFailure("Failed query: select 1");
        Object.assign(refused, {
            cause: new UnexpectedFailure("x", "ECONNREFUSED"),
        });
        const { runtime, written } = createFakeRuntime({
            services: {
                getHealth: vi.fn(async () => {
                    throw refused;
                }),
            },
        });
        await expect(runCli(["health", "--json"], runtime)).resolves.toBe(
            EXIT_CODES.NETWORK
        );
        const { error } = JSON.parse(written.out);
        expect(error.code).toBe("CLI_DATABASE_UNREACHABLE");
        expect(error.fix).toContain("DATABASE_URL");
    });

    it("exits 6 with the fix when there is no admin", async () => {
        const { runtime, written } = createFakeRuntime({
            services: {
                loadLibrary: vi.fn(async () => ({ tilesets: [], assets: [] })),
                seedLibrary: vi.fn(async () => {
                    throw new LibrarySeedAdminNotFoundError();
                }),
            },
        });
        await expect(
            runCli(["seed", "library", "--json"], runtime)
        ).resolves.toBe(EXIT_CODES.CONFLICT);
        expect(JSON.parse(written.out).error.fix).toContain(
            "standin bootstrap"
        );
    });

    it("exits 1 on an unexpected error and 5 on a down instance", async () => {
        const broken = createFakeRuntime({
            services: {
                getHealth: vi.fn(async () => {
                    throw new UnexpectedFailure("boom");
                }),
            },
        });
        await expect(
            runCli(["health", "--json"], broken.runtime)
        ).resolves.toBe(EXIT_CODES.INTERNAL);
        expect(JSON.parse(broken.written.out).error.message).toBe(
            "Unexpected error."
        );

        const down = createFakeRuntime({
            services: {
                getHealth: vi.fn(async () => ({
                    status: "down" as const,
                    timestamp: "t",
                    responseTimeMs: 2000,
                })),
            },
        });
        await expect(runCli(["health"], down.runtime)).resolves.toBe(
            EXIT_CODES.NETWORK
        );
    });
});
