import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
    OAuthEmailUnverifiedError,
    OAuthExchangeFailedError,
} from "@standin/contracts";

const mocks = vi.hoisted(() => ({
    exchangeCode: vi.fn(),
    fetchProfile: vi.fn(),
    resolveUser: vi.fn(),
    importPhoto: vi.fn(),
    createToken: vi.fn(() => "jwt"),
}));

// The real provider decides if the login is on and builds the authorize url
// from the environment. Only its two calls to GitHub are replaced.
vi.mock("@standin/infra", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@standin/infra")>();
    return {
        ...actual,
        GithubProvider: {
            ...actual.GithubProvider,
            exchangeCode: mocks.exchangeCode,
            getProfile: mocks.fetchProfile,
        },
    };
});
vi.mock("../../services/resolveUser", () => ({
    resolveUser: mocks.resolveUser,
}));
vi.mock("../../utils/importGithubProfilePicture", () => ({
    importGithubProfilePicture: mocks.importPhoto,
}));
vi.mock("../../../services/createToken", () => ({
    createToken: mocks.createToken,
}));

import { callback } from "../callback";
import { providers } from "../providers";
import { start } from "../start";

const ENV = {
    GITHUB_CLIENT_ID: "Iv1.abc",
    GITHUB_CLIENT_SECRET: "secret",
    GITHUB_CALLBACK_URL: "http://localhost:3001/auth/github/callback",
    FRONTEND_URL: "http://localhost:5173",
};

const buildRes = () => {
    const res: any = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    res.redirect = vi.fn(() => res);
    res.cookie = vi.fn(() => res);
    res.clearCookie = vi.fn(() => res);
    return res;
};

const buildReq = (
    query: Record<string, unknown>,
    cookie = "state-1.verifier-1"
) =>
    ({
        query,
        cookies: cookie ? { oauth_github: cookie } : {},
    }) as any;

const profile = {
    id: "42",
    login: "ana",
    name: "Ana",
    avatarUrl: "https://a/b",
};

describe("GitHub auth controllers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "error").mockImplementation(() => {});
        for (const [name, value] of Object.entries(ENV)) {
            vi.stubEnv(name, value);
        }
        mocks.exchangeCode.mockResolvedValue("gho_token");
        mocks.fetchProfile.mockResolvedValue(profile);
        mocks.resolveUser.mockResolvedValue({
            user: { id: "u1", profilePictureUrl: null },
            outcome: "created",
        });
        mocks.importPhoto.mockResolvedValue(true);
    });

    afterEach(() => vi.unstubAllEnvs());

    describe("providers", () => {
        it("says github is on with the variables", () => {
            const res = buildRes();

            providers({} as any, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({ github: true });
        });

        it("says github is off without them", () => {
            vi.stubEnv("GITHUB_CLIENT_ID", "");
            const res = buildRes();

            providers({} as any, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({ github: false });
        });
    });

    describe("start", () => {
        it("keeps state and verifier in a cookie and redirects to GitHub", () => {
            const res = buildRes();

            start({} as any, res, vi.fn());

            const [, value, options] = res.cookie.mock.calls[0];
            const [state, verifier] = value.split(".");
            expect(options).toMatchObject({ httpOnly: true });
            const target = new URL(res.redirect.mock.calls[0][0]);
            expect(target.origin).toBe("https://github.com");
            expect(target.searchParams.get("state")).toBe(state);
            expect(target.searchParams.get("code_challenge")).toBe(
                createHash("sha256").update(verifier).digest("base64url")
            );
        });

        it("answers 404 when the login is off", () => {
            vi.stubEnv("GITHUB_CLIENT_SECRET", "");
            const res = buildRes();

            start({} as any, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.redirect).not.toHaveBeenCalled();
            expect(res.cookie).not.toHaveBeenCalled();
        });
    });

    describe("callback", () => {
        it("signs in a new person, imports the photo and redirects to the web", async () => {
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }),
                res,
                vi.fn()
            );

            expect(mocks.exchangeCode).toHaveBeenCalledWith(
                expect.objectContaining({ code: "c", verifier: "verifier-1" })
            );
            expect(mocks.importPhoto).toHaveBeenCalledWith("u1", "https://a/b");
            expect(res.cookie).toHaveBeenCalledWith(
                "token",
                "jwt",
                expect.objectContaining({ httpOnly: true, sameSite: "lax" })
            );
            expect(res.redirect).toHaveBeenCalledWith("http://localhost:5173/");
        });

        it("does not import the photo of a person who was already linked", async () => {
            mocks.resolveUser.mockResolvedValue({
                user: { id: "u1", profilePictureUrl: null },
                outcome: "existing",
            });
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }),
                res,
                vi.fn()
            );

            expect(mocks.importPhoto).not.toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith("http://localhost:5173/");
        });

        it("imports the photo on link only when the person has none", async () => {
            mocks.resolveUser.mockResolvedValue({
                user: { id: "u1", profilePictureUrl: null },
                outcome: "linked",
            });
            await callback(
                buildReq({ code: "c", state: "state-1" }),
                buildRes(),
                vi.fn()
            );
            expect(mocks.importPhoto).toHaveBeenCalledTimes(1);

            mocks.importPhoto.mockClear();
            mocks.resolveUser.mockResolvedValue({
                user: { id: "u1", profilePictureUrl: "/files/f1" },
                outcome: "linked",
            });
            await callback(
                buildReq({ code: "c", state: "state-1" }),
                buildRes(),
                vi.fn()
            );
            expect(mocks.importPhoto).not.toHaveBeenCalled();
        });

        it("signs in even when the photo import fails", async () => {
            mocks.importPhoto.mockResolvedValue(false);
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }),
                res,
                vi.fn()
            );

            expect(res.cookie).toHaveBeenCalledWith(
                "token",
                "jwt",
                expect.anything()
            );
            expect(res.redirect).toHaveBeenCalledWith("http://localhost:5173/");
        });

        it("redirects with oauth_state_invalid on a different state", async () => {
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "forged" }),
                res,
                vi.fn()
            );

            expect(res.redirect).toHaveBeenCalledWith(
                "http://localhost:5173/?error=oauth_state_invalid"
            );
            expect(mocks.exchangeCode).not.toHaveBeenCalled();
            expect(res.cookie).not.toHaveBeenCalledWith(
                "token",
                expect.anything(),
                expect.anything()
            );
        });

        it("redirects with oauth_state_invalid when the cookie is gone", async () => {
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }, ""),
                res,
                vi.fn()
            );

            expect(res.redirect).toHaveBeenCalledWith(
                "http://localhost:5173/?error=oauth_state_invalid"
            );
        });

        it("redirects with oauth_access_denied when the person cancels", async () => {
            const res = buildRes();

            await callback(
                buildReq({
                    error: "access_denied",
                    error_description: "The user has denied your request.",
                    state: "state-1",
                }),
                res,
                vi.fn()
            );

            expect(res.redirect).toHaveBeenCalledWith(
                "http://localhost:5173/?error=oauth_access_denied"
            );
            expect(mocks.resolveUser).not.toHaveBeenCalled();
        });

        it("redirects with oauth_exchange_failed when there is no code", async () => {
            const res = buildRes();

            await callback(buildReq({ state: "state-1" }), res, vi.fn());

            expect(res.redirect).toHaveBeenCalledWith(
                "http://localhost:5173/?error=oauth_exchange_failed"
            );
        });

        it("redirects with oauth_exchange_failed when GitHub fails", async () => {
            mocks.exchangeCode.mockRejectedValue(
                new OAuthExchangeFailedError()
            );
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }),
                res,
                vi.fn()
            );

            expect(res.redirect).toHaveBeenCalledWith(
                "http://localhost:5173/?error=oauth_exchange_failed"
            );
        });

        it("redirects with github_email_unverified and signs nobody in", async () => {
            mocks.resolveUser.mockRejectedValue(
                new OAuthEmailUnverifiedError()
            );
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }),
                res,
                vi.fn()
            );

            expect(res.redirect).toHaveBeenCalledWith(
                "http://localhost:5173/?error=github_email_unverified"
            );
            expect(res.cookie).not.toHaveBeenCalledWith(
                "token",
                expect.anything(),
                expect.anything()
            );
        });

        it("hides an unexpected error behind a fixed code", async () => {
            mocks.resolveUser.mockRejectedValue(
                new Error("connection to db:5432 refused")
            );
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }),
                res,
                vi.fn()
            );

            expect(res.redirect).toHaveBeenCalledWith(
                "http://localhost:5173/?error=oauth_sign_in_failed"
            );
        });

        it("answers 404 when the login is off", async () => {
            vi.stubEnv("GITHUB_CLIENT_ID", "");
            const res = buildRes();

            await callback(
                buildReq({ code: "c", state: "state-1" }),
                res,
                vi.fn()
            );

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.redirect).not.toHaveBeenCalled();
            expect(mocks.exchangeCode).not.toHaveBeenCalled();
        });
    });
});
