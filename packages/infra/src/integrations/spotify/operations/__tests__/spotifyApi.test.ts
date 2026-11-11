import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    SpotifyAccessRevokedError,
    SpotifyAccessTokenExpiredError,
    SpotifyAccountNotAllowedError,
    SpotifyAuthorizationDeniedError,
    SpotifyCredentialsInvalidError,
    SpotifyRateLimitedError,
    SpotifyUnavailableError,
} from "@standin/contracts";
import { getCurrentlyPlaying } from "../getCurrentlyPlaying";
import { refreshAccessToken } from "../refreshAccessToken";
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

describe("refreshAccessToken", () => {
    const input = { credentials, refreshToken: "refresh" };

    it("returns the new access token and a rotated refresh token", async () => {
        fetchMock.mockResolvedValue(
            json({ access_token: "a", refresh_token: "r2" })
        );

        await expect(refreshAccessToken(input)).resolves.toEqual({
            accessToken: "a",
            refreshToken: "r2",
        });
    });

    it("returns a null refresh token when Spotify keeps the old one", async () => {
        fetchMock.mockResolvedValue(json({ access_token: "a" }));

        await expect(refreshAccessToken(input)).resolves.toEqual({
            accessToken: "a",
            refreshToken: null,
        });
    });

    it("calls invalid_grant an access the person removed", async () => {
        fetchMock.mockResolvedValue(json({ error: "invalid_grant" }, 400));

        await expect(refreshAccessToken(input)).rejects.toBeInstanceOf(
            SpotifyAccessRevokedError
        );
    });

    it("calls any other 400 an app Spotify does not accept", async () => {
        fetchMock.mockResolvedValue(json({ error: "invalid_client" }, 400));

        await expect(refreshAccessToken(input)).rejects.toBeInstanceOf(
            SpotifyCredentialsInvalidError
        );
    });

    it("treats a 500 as Spotify being unavailable", async () => {
        fetchMock.mockResolvedValue(json({}, 500));

        await expect(refreshAccessToken(input)).rejects.toBeInstanceOf(
            SpotifyUnavailableError
        );
    });
});

describe("getCurrentlyPlaying", () => {
    const item = {
        id: "t1",
        name: "ALEXA 2",
        artists: [{ name: "LH CHUCRO" }, { name: "Drummond" }],
        album: { images: [{ url: "https://img/1" }, { url: "https://img/2" }] },
        external_urls: { spotify: "https://open.spotify.com/track/t1" },
    };

    it("reads the track with its first cover", async () => {
        fetchMock.mockResolvedValue(
            json({ is_playing: true, currently_playing_type: "track", item })
        );

        await expect(getCurrentlyPlaying("token")).resolves.toEqual({
            trackId: "t1",
            title: "ALEXA 2",
            artists: ["LH CHUCRO", "Drummond"],
            coverUrl: "https://img/1",
            url: "https://open.spotify.com/track/t1",
            isPlaying: true,
        });
    });

    it("keeps a paused track, marked as not playing", async () => {
        fetchMock.mockResolvedValue(
            json({ is_playing: false, currently_playing_type: "track", item })
        );

        await expect(getCurrentlyPlaying("token")).resolves.toMatchObject({
            isPlaying: false,
        });
    });

    it("shows nothing for a 204, which is also a private session", async () => {
        fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

        await expect(getCurrentlyPlaying("token")).resolves.toBeNull();
    });

    it.each(["ad", "episode", "unknown"])(
        "shows nothing for %s",
        async (type) => {
            fetchMock.mockResolvedValue(
                json({ is_playing: true, currently_playing_type: type, item })
            );

            await expect(getCurrentlyPlaying("token")).resolves.toBeNull();
        }
    );

    it("shows nothing when the item is missing", async () => {
        fetchMock.mockResolvedValue(
            json({
                is_playing: true,
                currently_playing_type: "track",
                item: null,
            })
        );

        await expect(getCurrentlyPlaying("token")).resolves.toBeNull();
    });

    it("has no cover when the album has no image", async () => {
        fetchMock.mockResolvedValue(
            json({
                is_playing: true,
                currently_playing_type: "track",
                item: { ...item, album: { images: [] } },
            })
        );

        await expect(getCurrentlyPlaying("token")).resolves.toMatchObject({
            coverUrl: null,
        });
    });

    it("calls a 401 an expired token", async () => {
        fetchMock.mockResolvedValue(json({}, 401));

        await expect(getCurrentlyPlaying("token")).rejects.toBeInstanceOf(
            SpotifyAccessTokenExpiredError
        );
    });

    it("calls a 403 an account the app does not serve", async () => {
        fetchMock.mockResolvedValue(json({}, 403));

        await expect(getCurrentlyPlaying("token")).rejects.toBeInstanceOf(
            SpotifyAccountNotAllowedError
        );
    });

    it("carries the Retry-After of a 429 in milliseconds", async () => {
        fetchMock.mockResolvedValue(
            new Response("{}", { status: 429, headers: { "retry-after": "7" } })
        );

        await expect(getCurrentlyPlaying("token")).rejects.toMatchObject({
            retryAfterMs: 7000,
        });
    });

    it("has no wait for a 429 without a valid Retry-After", async () => {
        fetchMock.mockResolvedValue(
            new Response("{}", { status: 429, headers: { "retry-after": "x" } })
        );

        const error = await getCurrentlyPlaying("token").catch(
            (cause: unknown) => cause
        );

        expect(error).toBeInstanceOf(SpotifyRateLimitedError);
        expect(error).toMatchObject({ retryAfterMs: null });
    });

    it("treats a malformed answer as Spotify being unavailable", async () => {
        fetchMock.mockResolvedValue(json({ is_playing: "yes" }));

        await expect(getCurrentlyPlaying("token")).rejects.toBeInstanceOf(
            SpotifyUnavailableError
        );
    });
});
