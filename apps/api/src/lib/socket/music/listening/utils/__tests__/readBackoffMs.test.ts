import { describe, expect, it } from "vitest";
import {
    LISTENING_DEFAULT_BACKOFF_MS,
    LISTENING_MAX_BACKOFF_MS,
} from "@standin/contracts";
import { readBackoffMs } from "../readBackoffMs";

describe("readBackoffMs", () => {
    it("respects the wait Spotify asked for", () => {
        expect(readBackoffMs(12_000)).toBe(12_000);
    });

    it("uses the default when Spotify sent no wait", () => {
        expect(readBackoffMs(null)).toBe(LISTENING_DEFAULT_BACKOFF_MS);
    });

    it("caps a wait that is too long", () => {
        expect(readBackoffMs(24 * 60 * 60_000)).toBe(LISTENING_MAX_BACKOFF_MS);
    });
});
