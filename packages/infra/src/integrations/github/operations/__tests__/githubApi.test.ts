import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthExchangeFailedError } from "@standin/contracts";
import { exchangeCode } from "../exchangeCode";
import { getProfile } from "../getProfile";
import { getVerifiedEmail } from "../getVerifiedEmail";

const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });

const callbackUrl = "http://localhost:3001/auth/github/callback";

describe("GitHub services with a mocked fetch", () => {
    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
        vi.stubEnv("GITHUB_CLIENT_ID", "id");
        vi.stubEnv("GITHUB_CLIENT_SECRET", "secret");
        vi.stubEnv("GITHUB_CALLBACK_URL", callbackUrl);
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    describe("exchangeCode", () => {
        it("posts the code with the PKCE verifier and returns the token", async () => {
            fetchMock.mockResolvedValue(json({ access_token: "gho_token" }));

            const token = await exchangeCode({
                code: "the-code",
                verifier: "the-verifier",
            });

            expect(token).toBe("gho_token");
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe("https://github.com/login/oauth/access_token");
            expect(init.method).toBe("POST");
            expect(init.redirect).toBe("error");
            expect(init.signal).toBeInstanceOf(AbortSignal);
            expect(JSON.parse(init.body)).toEqual({
                client_id: "id",
                client_secret: "secret",
                code: "the-code",
                redirect_uri: callbackUrl,
                code_verifier: "the-verifier",
            });
        });

        it("fails when GitHub answers 200 with an error body", async () => {
            fetchMock.mockResolvedValue(
                json({ error: "bad_verification_code" })
            );

            await expect(
                exchangeCode({ code: "x", verifier: "v" })
            ).rejects.toBeInstanceOf(OAuthExchangeFailedError);
        });

        it("fails on a server error", async () => {
            fetchMock.mockResolvedValue(json({}, 502));

            await expect(
                exchangeCode({ code: "x", verifier: "v" })
            ).rejects.toBeInstanceOf(OAuthExchangeFailedError);
        });

        it("fails on a timeout", async () => {
            fetchMock.mockRejectedValue(
                new DOMException("timed out", "TimeoutError")
            );

            await expect(
                exchangeCode({ code: "x", verifier: "v" })
            ).rejects.toBeInstanceOf(OAuthExchangeFailedError);
        });

        it("fails on a body that is not JSON", async () => {
            fetchMock.mockResolvedValue(new Response("<html>"));

            await expect(
                exchangeCode({ code: "x", verifier: "v" })
            ).rejects.toBeInstanceOf(OAuthExchangeFailedError);
        });

        it("keeps the secret out of the log", async () => {
            fetchMock.mockRejectedValue(new Error("network down"));

            await expect(
                exchangeCode({ code: "x", verifier: "v" })
            ).rejects.toThrow();

            expect(
                JSON.stringify(vi.mocked(console.error).mock.calls)
            ).not.toContain("secret");
        });
    });

    describe("getProfile", () => {
        it("reads the numeric id, the login, the name and the avatar", async () => {
            fetchMock.mockResolvedValue(
                json({
                    id: 583231,
                    login: "octocat",
                    name: "The Octocat",
                    avatar_url:
                        "https://avatars.githubusercontent.com/u/583231",
                    email: "not-trusted@example.com",
                })
            );

            const profile = await getProfile("gho_token");

            expect(profile).toEqual({
                id: "583231",
                login: "octocat",
                name: "The Octocat",
                avatarUrl: "https://avatars.githubusercontent.com/u/583231",
            });
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe("https://api.github.com/user");
            expect(init.headers.Authorization).toBe("Bearer gho_token");
        });

        it("accepts a null name and avatar", async () => {
            fetchMock.mockResolvedValue(
                json({ id: 1, login: "a", name: null, avatar_url: null })
            );

            expect(await getProfile("t")).toEqual({
                id: "1",
                login: "a",
                name: null,
                avatarUrl: null,
            });
        });

        it("fails on a 401", async () => {
            fetchMock.mockResolvedValue(json({}, 401));

            await expect(getProfile("t")).rejects.toBeInstanceOf(
                OAuthExchangeFailedError
            );
        });

        it("fails when the id is missing", async () => {
            fetchMock.mockResolvedValue(json({ login: "a" }));

            await expect(getProfile("t")).rejects.toBeInstanceOf(
                OAuthExchangeFailedError
            );
        });
    });

    describe("getVerifiedEmail", () => {
        it("returns the primary e-mail when verified", async () => {
            fetchMock.mockResolvedValue(
                json([
                    {
                        email: "other@example.com",
                        primary: false,
                        verified: true,
                    },
                    { email: "me@example.com", primary: true, verified: true },
                ])
            );

            expect(await getVerifiedEmail("t")).toBe("me@example.com");
            expect(fetchMock.mock.calls[0][0]).toBe(
                "https://api.github.com/user/emails"
            );
        });

        it("returns null when the primary e-mail is not verified", async () => {
            fetchMock.mockResolvedValue(
                json([
                    { email: "me@example.com", primary: true, verified: false },
                    {
                        email: "other@example.com",
                        primary: false,
                        verified: true,
                    },
                ])
            );

            expect(await getVerifiedEmail("t")).toBeNull();
        });

        it("returns null with no e-mails", async () => {
            fetchMock.mockResolvedValue(json([]));

            expect(await getVerifiedEmail("t")).toBeNull();
        });

        it("fails when GitHub refuses the call", async () => {
            fetchMock.mockResolvedValue(json({}, 403));

            await expect(getVerifiedEmail("t")).rejects.toBeInstanceOf(
                OAuthExchangeFailedError
            );
        });

        it("fails on an unexpected shape", async () => {
            fetchMock.mockResolvedValue(json({ message: "hi" }));

            await expect(getVerifiedEmail("t")).rejects.toBeInstanceOf(
                OAuthExchangeFailedError
            );
        });
    });
});
