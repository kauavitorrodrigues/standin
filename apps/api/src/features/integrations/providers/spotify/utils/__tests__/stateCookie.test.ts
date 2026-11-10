import { describe, expect, it, vi } from "vitest";
import { SpotifyStateInvalidError } from "@standin/contracts";
import { SPOTIFY_STATE_COOKIE } from "../../consts";
import {
    consumeSpotifyStateCookie,
    createSpotifyState,
    writeSpotifyStateCookie,
} from "../stateCookie";

const attempt = {
    state: "the-state",
    organizationId: "org-1",
    userId: "user-1",
};

// Writes the attempt and hands back the cookie value Express would send.
const writtenValue = (): string => {
    const cookie = vi.fn();
    writeSpotifyStateCookie({ cookie } as never, attempt);
    return cookie.mock.calls[0][1] as string;
};

const consume = (cookies: unknown, received: unknown) => {
    const clearCookie = vi.fn();
    const run = () =>
        consumeSpotifyStateCookie(
            { cookies } as never,
            { clearCookie } as never,
            received
        );
    return { run, clearCookie };
};

describe("Spotify state cookie", () => {
    it("creates a different state each time", () => {
        expect(createSpotifyState()).not.toBe(createSpotifyState());
    });

    it("gives the attempt back when the state matches", () => {
        const { run } = consume(
            { [SPOTIFY_STATE_COOKIE]: writtenValue() },
            attempt.state
        );

        expect(run()).toEqual(attempt);
    });

    it("rejects a missing cookie", () => {
        const { run } = consume({}, attempt.state);

        expect(run).toThrow(SpotifyStateInvalidError);
    });

    it("rejects a cookie with the wrong number of parts", () => {
        const { run } = consume(
            { [SPOTIFY_STATE_COOKIE]: "only-one" },
            "only-one"
        );

        expect(run).toThrow(SpotifyStateInvalidError);
    });

    it("rejects a different state", () => {
        const { run } = consume(
            { [SPOTIFY_STATE_COOKIE]: writtenValue() },
            "another-state"
        );

        expect(run).toThrow(SpotifyStateInvalidError);
    });

    it("clears the cookie on every try, so it works once", () => {
        const { run, clearCookie } = consume({}, attempt.state);

        expect(run).toThrow(SpotifyStateInvalidError);
        expect(clearCookie).toHaveBeenCalledOnce();
    });
});
