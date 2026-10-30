import { describe, expect, it } from "vitest";
import { createMemoryConfigStore } from "../../testing/createMemoryConfigStore";
import { resolveRemoteTarget } from "../resolveRemoteTarget";

const SAVED = { url: "https://file.test", token: "file-token" };
const ENV = { STANDIN_URL: "https://env.test", STANDIN_TOKEN: "env-token" };

const resolve = (
    args: Parameters<typeof resolveRemoteTarget>[0],
    env: Parameters<typeof resolveRemoteTarget>[1],
    saved = SAVED
) => {
    const { store } = createMemoryConfigStore(saved);
    return { store, promise: resolveRemoteTarget(args, env, store) };
};

describe("resolveRemoteTarget", () => {
    it("lets the flags win over the environment and the file", async () => {
        const { promise } = resolve(
            { url: "https://flag.test", token: "flag-token" },
            ENV
        );

        await expect(promise).resolves.toEqual({
            url: "https://flag.test",
            token: "flag-token",
        });
    });

    it("lets the environment win over the file", async () => {
        const { promise } = resolve({}, ENV);

        await expect(promise).resolves.toEqual({
            url: "https://env.test",
            token: "env-token",
        });
    });

    it("falls back to the file", async () => {
        const { promise } = resolve({}, {});

        await expect(promise).resolves.toEqual({
            url: "https://file.test",
            token: "file-token",
        });
    });

    it("mixes a flag and a variable, which are given by the same caller", async () => {
        const { promise } = resolve({ token: "flag-token" }, ENV);

        await expect(promise).resolves.toEqual({
            url: "https://env.test",
            token: "flag-token",
        });
    });

    it("uses the saved token for the saved URL, spelled any way", async () => {
        const { promise } = resolve({ url: "https://FILE.test//" }, {});

        await expect(promise).resolves.toEqual({
            url: "https://file.test",
            token: "file-token",
        });
    });

    it("does not send the saved token to a different URL", async () => {
        const { promise } = resolve({ url: "https://other.test" }, {});

        const error = await promise.catch((e: unknown) => e);
        expect(error).toMatchObject({ code: "CLI_REMOTE_TOKEN_MISSING" });
        expect((error as { hints: { fix: string } }).hints.fix).toContain(
            "STANDIN_TOKEN"
        );
    });

    it("does not send the saved token to a different URL from the environment", async () => {
        const { promise } = resolve({}, { STANDIN_URL: "https://env.test" });

        await expect(promise).rejects.toMatchObject({
            code: "CLI_REMOTE_TOKEN_MISSING",
        });
    });

    it("does not send a token from the flags to the saved URL", async () => {
        const { promise } = resolve({ token: "flag-token" }, {});

        const error = await promise.catch((e: unknown) => e);
        expect(error).toMatchObject({ code: "CLI_REMOTE_URL_MISSING" });
        expect((error as { hints: { fix: string } }).hints.fix).toContain(
            "STANDIN_URL"
        );
    });

    it("does not send a token from the environment to the saved URL", async () => {
        const { promise } = resolve({}, { STANDIN_TOKEN: "env-token" });

        await expect(promise).rejects.toMatchObject({
            code: "CLI_REMOTE_URL_MISSING",
        });
    });

    it("does not read the file when both values are given", async () => {
        const { store, promise } = resolve({}, ENV);
        await promise;

        expect(store.read).not.toHaveBeenCalled();
    });

    it("treats blank values as not set", async () => {
        const { promise } = resolve({ url: "  ", token: "" }, {});

        await expect(promise).resolves.toEqual({
            url: "https://file.test",
            token: "file-token",
        });
    });

    it("strips trailing slashes from the URL", async () => {
        const { promise } = resolve({ url: "https://x.test/api//" }, ENV);

        await expect(promise).resolves.toMatchObject({
            url: "https://x.test/api",
        });
    });

    it("fails with the URL error when nothing gives a URL", async () => {
        const { promise } = resolve({ token: "t" }, {}, {} as typeof SAVED);

        await expect(promise).rejects.toMatchObject({
            code: "CLI_REMOTE_URL_MISSING",
        });
    });

    it("fails with the token error when nothing gives a token", async () => {
        const { promise } = resolve(
            { url: "https://x.test" },
            {},
            {} as typeof SAVED
        );

        await expect(promise).rejects.toMatchObject({
            code: "CLI_REMOTE_TOKEN_MISSING",
        });
    });

    it.each(["localhost:3001", "ftp://x.test", "not a url"])(
        "refuses the URL %s",
        async (url) => {
            const { promise } = resolve({ url, token: "t" }, {});

            await expect(promise).rejects.toMatchObject({
                code: "CLI_REMOTE_URL_INVALID",
            });
        }
    );

    describe("the protocol", () => {
        it.each([
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://[::1]:3001",
            "https://standin.example.com",
        ])("accepts %s", async (url) => {
            const { promise } = resolve({ url, token: "t" }, {});

            await expect(promise).resolves.toMatchObject({ token: "t" });
        });

        it.each(["http://standin.example.com", "http://10.0.0.5:3001"])(
            "refuses plain http to the remote host %s and says to use https",
            async (url) => {
                const { promise } = resolve({ url, token: "t" }, {});

                const error = await promise.catch((e: unknown) => e);
                expect(error).toMatchObject({
                    code: "CLI_REMOTE_URL_INVALID",
                });
                expect(
                    (error as { hints: { fix: string } }).hints.fix
                ).toContain("https");
            }
        );
    });
});
