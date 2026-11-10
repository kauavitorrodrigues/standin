import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    SpotifyAccountNotAllowedError,
    SpotifyAuthorizationDeniedError,
    SpotifyCredentialsInvalidError,
    SpotifyUnavailableError,
} from "@standin/contracts";
import { exchangeCode } from "../exchangeCode";
import { getProfile } from "../getProfile";
import { verifyCredentials } from "../verifyCredentials";

const fetchMock = vi.fn();

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });

const credentials = { clientId: "id", clientSecret: "secret" };

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("verifyCredentials", () => {
    it("accepts a pair Spotify answers 200 to", async () => {
        fetchMock.mockResolvedValue(json({ access_token: "t" }));

        await expect(verifyCredentials(credentials)).resolves.toBeUndefined();
    });

    it.each([400, 401])("calls a %i an invalid pair", async (status) => {
        fetchMock.mockResolvedValue(json({ error: "invalid_client" }, status));

        await expect(verifyCredentials(credentials)).rejects.toBeInstanceOf(
            SpotifyCredentialsInvalidError
        );
    });

    it("calls any other status unavailable", async () => {
        fetchMock.mockResolvedValue(json({}, 503));

        await expect(verifyCredentials(credentials)).rejects.toBeInstanceOf(
            SpotifyUnavailableError
        );
    });
});

describe("exchangeCode", () => {
    const input = { credentials, redirectUri: "http://x/cb", code: "c" };

    it("returns the tokens", async () => {
        fetchMock.mockResolvedValue(
            json({ access_token: "a", refresh_token: "r", scope: "s" })
        );

        expect(await exchangeCode(input)).toEqual({
            accessToken: "a",
            refreshToken: "r",
            scope: "s",
        });
    });

    it("calls a refused code the authorization that did not hold", async () => {
        fetchMock.mockResolvedValue(json({ error: "invalid_grant" }, 400));

        await expect(exchangeCode(input)).rejects.toBeInstanceOf(
            SpotifyAuthorizationDeniedError
        );
    });

    it("calls any other 400 an app Spotify no longer accepts", async () => {
        fetchMock.mockResolvedValue(json({ error: "invalid_client" }, 400));

        await expect(exchangeCode(input)).rejects.toBeInstanceOf(
            SpotifyCredentialsInvalidError
        );
    });
});

describe("getProfile", () => {
    it("reads the id and the first photo", async () => {
        fetchMock.mockResolvedValue(
            json({ id: "me", images: [{ url: "https://img/1" }, { url: "x" }] })
        );

        expect(await getProfile("token")).toEqual({
            id: "me",
            imageUrl: "https://img/1",
        });
    });

    it("has no photo when Spotify sends none", async () => {
        fetchMock.mockResolvedValue(json({ id: "me" }));

        expect(await getProfile("token")).toEqual({
            id: "me",
            imageUrl: null,
        });
    });

    it("calls a 403 an account that is not on the list of the app", async () => {
        fetchMock.mockResolvedValue(json({}, 403));

        await expect(getProfile("token")).rejects.toBeInstanceOf(
            SpotifyAccountNotAllowedError
        );
    });
});
