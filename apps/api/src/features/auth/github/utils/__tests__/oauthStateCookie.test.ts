import { describe, expect, it, vi } from "vitest";
import { OAuthStateInvalidError } from "@standin/contracts";
import {
    consumeOAuthStateCookie,
    createOAuthStateSecrets,
    writeOAuthStateCookie,
} from "../oauthStateCookie";

const buildRes = () => ({ cookie: vi.fn(), clearCookie: vi.fn() });

describe("oauth state cookie", () => {
    it("makes different secrets every time", () => {
        const a = createOAuthStateSecrets();
        const b = createOAuthStateSecrets();

        expect(a.state).not.toBe(b.state);
        expect(a.verifier).not.toBe(b.verifier);
        expect(a.state.length).toBeGreaterThanOrEqual(43);
    });

    it("writes a short lived httpOnly lax cookie", () => {
        const res = buildRes();

        writeOAuthStateCookie(res as never, { state: "s", verifier: "v" });

        expect(res.cookie).toHaveBeenCalledWith(
            "oauth_github",
            "s.v",
            expect.objectContaining({
                httpOnly: true,
                sameSite: "lax",
                maxAge: 10 * 60 * 1000,
            })
        );
    });

    it("returns the verifier when the state matches", () => {
        const res = buildRes();
        const req = { cookies: { oauth_github: "abc.verifier" } };

        expect(consumeOAuthStateCookie(req as never, res as never, "abc")).toBe(
            "verifier"
        );
    });

    it("clears the cookie on every try", () => {
        const res = buildRes();
        const req = { cookies: { oauth_github: "abc.verifier" } };

        expect(() =>
            consumeOAuthStateCookie(req as never, res as never, "other")
        ).toThrow();
        expect(res.clearCookie).toHaveBeenCalledWith(
            "oauth_github",
            expect.anything()
        );
    });

    it.each([
        ["a different state", { oauth_github: "abc.v" }, "abd"],
        ["a state of another length", { oauth_github: "abc.v" }, "abcd"],
        ["no cookie", {}, "abc"],
        ["a malformed cookie", { oauth_github: "abc" }, "abc"],
        ["a cookie with extra parts", { oauth_github: "abc.v.x" }, "abc"],
        ["no state in the query", { oauth_github: "abc.v" }, undefined],
        ["a state that is not a string", { oauth_github: "abc.v" }, ["abc"]],
    ])("refuses %s", (_name, cookies, received) => {
        expect(() =>
            consumeOAuthStateCookie(
                { cookies } as never,
                buildRes() as never,
                received
            )
        ).toThrow(OAuthStateInvalidError);
    });

    it("refuses a request with no cookie parser output", () => {
        expect(() =>
            consumeOAuthStateCookie({} as never, buildRes() as never, "abc")
        ).toThrow(OAuthStateInvalidError);
    });
});
