import { describe, expect, it } from "vitest";
import {
    SPOTIFY_MAX_CONNECTIONS,
    SpotifyNotConfiguredError,
} from "@standin/contracts";
import { assertSameApp, isReplacedApp } from "../helpers/appChanges";
import { hasNoPlaceLeft } from "../helpers/places";

const row = (clientId: string) => ({ clientId, clientSecretSealed: "s" });

describe("hasNoPlaceLeft", () => {
    it("lets the sixth person in only when nobody else fills the app", () => {
        expect(hasNoPlaceLeft(false, SPOTIFY_MAX_CONNECTIONS - 1)).toBe(false);
        expect(hasNoPlaceLeft(false, SPOTIFY_MAX_CONNECTIONS)).toBe(true);
    });

    it("never refuses someone who already holds a place", () => {
        expect(hasNoPlaceLeft(true, SPOTIFY_MAX_CONNECTIONS)).toBe(false);
    });
});

describe("isReplacedApp", () => {
    it("is false for a first save and for the same client ID", () => {
        expect(isReplacedApp(null, "a")).toBe(false);
        expect(isReplacedApp(row("a"), "a")).toBe(false);
    });

    it("is true for another client ID", () => {
        expect(isReplacedApp(row("a"), "b")).toBe(true);
    });
});

describe("assertSameApp", () => {
    const credentials = { clientId: "a", clientSecret: "x" };

    it("passes for the same app", () => {
        expect(() => assertSameApp(row("a"), credentials)).not.toThrow();
    });

    it("refuses a removed or replaced app", () => {
        expect(() => assertSameApp(null, credentials)).toThrow(
            SpotifyNotConfiguredError
        );
        expect(() => assertSameApp(row("b"), credentials)).toThrow(
            SpotifyNotConfiguredError
        );
    });
});
