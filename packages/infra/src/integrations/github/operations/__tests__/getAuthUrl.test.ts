import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OAuthProviderDisabledError } from "@standin/contracts";
import { getAuthUrl } from "../getAuthUrl";

const setEnv = (secret = "secret") => {
    vi.stubEnv("GITHUB_CLIENT_ID", "Iv1.abc");
    vi.stubEnv("GITHUB_CLIENT_SECRET", secret);
    vi.stubEnv(
        "GITHUB_CALLBACK_URL",
        "http://localhost:3001/auth/github/callback"
    );
};

describe("getAuthUrl", () => {
    beforeEach(() => setEnv());
    afterEach(() => vi.unstubAllEnvs());

    it("builds the GitHub authorize url with the PKCE challenge", () => {
        const url = new URL(
            getAuthUrl({
                state: "the-state",
                verifier: "the-verifier",
            })
        );

        expect(`${url.origin}${url.pathname}`).toBe(
            "https://github.com/login/oauth/authorize"
        );
        expect(Object.fromEntries(url.searchParams)).toEqual({
            client_id: "Iv1.abc",
            redirect_uri: "http://localhost:3001/auth/github/callback",
            state: "the-state",
            code_challenge: createHash("sha256")
                .update("the-verifier")
                .digest("base64url"),
            code_challenge_method: "S256",
        });
    });

    it("throws when the login is not configured", () => {
        vi.stubEnv("GITHUB_CLIENT_SECRET", "");

        expect(() => getAuthUrl({ state: "s", verifier: "v" })).toThrow(
            OAuthProviderDisabledError
        );
    });

    it("never puts the client secret in the url", () => {
        const url = getAuthUrl({
            state: "s",
            verifier: "v",
        });

        expect(url).not.toContain("do-not-leak");
    });
});
