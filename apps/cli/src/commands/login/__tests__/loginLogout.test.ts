import { describe, expect, it } from "vitest";
import { EXIT_CODES } from "../../../consts/exitCodes";
import { FAKE_CONFIG_PATH } from "../../../testing/createMemoryConfigStore";
import {
    FAKE_TOKEN,
    FAKE_URL,
    REMOTE_ENV,
    runCliFake,
} from "../../../testing/runCliFake";

describe("login", () => {
    it("saves the URL and the token and never prints the token", async () => {
        const run = await runCliFake([
            "login",
            "--url",
            `${FAKE_URL}/`,
            "--token",
            FAKE_TOKEN,
        ]);

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.config.state.file).toEqual({
            url: FAKE_URL,
            token: FAKE_TOKEN,
        });
        expect(run.out).toContain(FAKE_CONFIG_PATH);
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
        expect(run.fake.requests).toHaveLength(0);
    });

    it("keeps the token out of the JSON result", async () => {
        const run = await runCliFake([
            "login",
            "--url",
            FAKE_URL,
            "--token",
            FAKE_TOKEN,
            "--json",
        ]);

        expect(JSON.parse(run.out)).toEqual({
            ok: true,
            command: "login",
            result: {
                dryRun: false,
                url: FAKE_URL,
                configPath: FAKE_CONFIG_PATH,
            },
        });
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("reads the values from the environment", async () => {
        const run = await runCliFake(["login"], { env: REMOTE_ENV });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.config.state.file?.token).toBe(FAKE_TOKEN);
    });

    it("--dry-run writes nothing", async () => {
        const run = await runCliFake([
            "login",
            "--url",
            FAKE_URL,
            "--token",
            FAKE_TOKEN,
            "--dry-run",
        ]);

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.config.state.file).toBeUndefined();
        expect(run.fake.config.store.write).not.toHaveBeenCalled();
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("exits 2 without a token, no prompt", async () => {
        const run = await runCliFake(["login", "--url", FAKE_URL, "--json"], {
            interactive: true,
            answer: FAKE_TOKEN,
        });

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(JSON.parse(run.out).error.code).toBe("CLI_REMOTE_TOKEN_MISSING");
        expect(run.fake.io.ask).not.toHaveBeenCalled();
        expect(run.fake.config.store.write).not.toHaveBeenCalled();
    });

    it("exits 2 for a URL that is not http or https, without echoing it", async () => {
        const run = await runCliFake([
            "login",
            "--url",
            "ftp://user:pw@x.test",
            "--token",
            FAKE_TOKEN,
        ]);

        expect(run.code).toBe(EXIT_CODES.USAGE);
        expect(run.err).toContain("CLI_REMOTE_URL_INVALID");
        expect(run.err).not.toContain("pw");
    });

    it("drops credentials and the query from a valid URL", async () => {
        const run = await runCliFake([
            "login",
            "--url",
            "https://u:p@x.test/base/?a=1",
            "--token",
            FAKE_TOKEN,
        ]);

        expect(run.fake.config.state.file?.url).toBe("https://x.test/base");
        expect(run.out).not.toContain("u:p");
    });
});

describe("logout", () => {
    it("deletes the file", async () => {
        const run = await runCliFake(["logout", "--json"], {
            saved: { url: FAKE_URL, token: FAKE_TOKEN },
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(JSON.parse(run.out).result).toEqual({
            dryRun: false,
            configPath: FAKE_CONFIG_PATH,
            removed: true,
        });
        expect(run.fake.config.state.file).toBeUndefined();
        expect(run.out + run.err).not.toContain(FAKE_TOKEN);
    });

    it("succeeds when nobody was logged in", async () => {
        const run = await runCliFake(["logout"]);

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.out).toContain("not logged in");
    });

    it("--dry-run keeps the file", async () => {
        const run = await runCliFake(["logout", "--dry-run"], {
            saved: { url: FAKE_URL, token: FAKE_TOKEN },
        });

        expect(run.code).toBe(EXIT_CODES.OK);
        expect(run.fake.config.state.file).toBeDefined();
        expect(run.fake.config.store.remove).not.toHaveBeenCalled();
    });

    describe("login with plain http", () => {
        it.each([
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://[::1]:3001",
        ])("saves %s, which is this machine", async (url) => {
            const run = await runCliFake([
                "login",
                "--url",
                url,
                "--token",
                FAKE_TOKEN,
            ]);

            expect(run.code).toBe(EXIT_CODES.OK);
        });

        it("refuses http to a remote host and says to use https", async () => {
            const run = await runCliFake([
                "login",
                "--url",
                "http://standin.example.com",
                "--token",
                FAKE_TOKEN,
                "--json",
            ]);

            expect(run.code).toBe(EXIT_CODES.USAGE);
            const { error } = JSON.parse(run.out);
            expect(error.code).toBe("CLI_REMOTE_URL_INVALID");
            expect(error.fix).toContain("https");
            expect(run.fake.config.state.file).toBeUndefined();
        });

        it("accepts https", async () => {
            const run = await runCliFake([
                "login",
                "--url",
                "https://standin.example.com",
                "--token",
                FAKE_TOKEN,
            ]);

            expect(run.code).toBe(EXIT_CODES.OK);
        });
    });
});
