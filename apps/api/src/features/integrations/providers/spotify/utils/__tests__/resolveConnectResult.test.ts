import { describe, expect, it } from "vitest";
import {
    SPOTIFY_CONNECT_RESULTS,
    SpotifyAccountTakenError,
    SpotifyAccountNotAllowedError,
    SpotifyAuthorizationDeniedError,
    SpotifyConnectionLimitError,
    SpotifyNotConfiguredError,
    SpotifyStateInvalidError,
    SpotifyUnavailableError,
} from "@standin/contracts";
import { resolveSpotifyConnectResult } from "../resolveConnectResult";

describe("resolveSpotifyConnectResult", () => {
    it.each([
        [new SpotifyAuthorizationDeniedError(), SPOTIFY_CONNECT_RESULTS.DENIED],
        [
            new SpotifyConnectionLimitError(),
            SPOTIFY_CONNECT_RESULTS.LIMIT_REACHED,
        ],
        [
            new SpotifyAccountNotAllowedError(),
            SPOTIFY_CONNECT_RESULTS.NOT_ALLOWED,
        ],
        [new SpotifyAccountTakenError(), SPOTIFY_CONNECT_RESULTS.ACCOUNT_TAKEN],
        [
            new SpotifyNotConfiguredError(),
            SPOTIFY_CONNECT_RESULTS.NOT_CONFIGURED,
        ],
        [new SpotifyStateInvalidError(), SPOTIFY_CONNECT_RESULTS.STATE_INVALID],
    ])("maps %o to its code", (error, expected) => {
        expect(resolveSpotifyConnectResult(error)).toBe(expected);
    });

    it("calls any other error a failure", () => {
        expect(resolveSpotifyConnectResult(new SpotifyUnavailableError())).toBe(
            SPOTIFY_CONNECT_RESULTS.FAILED
        );
        expect(resolveSpotifyConnectResult("boom")).toBe(
            SPOTIFY_CONNECT_RESULTS.FAILED
        );
    });
});
