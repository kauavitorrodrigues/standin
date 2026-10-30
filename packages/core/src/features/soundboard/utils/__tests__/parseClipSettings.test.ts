import { describe, expect, it } from "vitest";
import {
    SoundboardIconInvalidError,
    SoundboardVolumeInvalidError,
} from "@standin/contracts";
import { parseIcon, parseVolume } from "../parseClipSettings";

describe("parseIcon", () => {
    it.each([[undefined], [null], [""], ["   "]])(
        "treats %j as no icon",
        (value) => {
            expect(parseIcon(value)).toBeNull();
        }
    );

    it.each([["🔥"], ["👍🏽"], ["👨‍👩‍👧"], ["🇧🇷"], ["1️⃣"]])(
        "accepts the single emoji %s",
        (value) => {
            expect(parseIcon(value)).toBe(value);
        }
    );

    it.each([["a"], ["ab"], ["🔥🔥"], ["1"], ["x🔥"], [12], ["🔥".repeat(20)]])(
        "refuses %j",
        (value) => {
            expect(() => parseIcon(value)).toThrow(SoundboardIconInvalidError);
        }
    );
});

describe("parseVolume", () => {
    it("falls back to the full level when none is sent", () => {
        expect(parseVolume(undefined)).toBe(1);
        expect(parseVolume("")).toBe(1);
    });

    it.each([
        ["0", 0],
        ["0.35", 0.35],
        [1, 1],
        [0.5, 0.5],
    ])("reads %j", (value, expected) => {
        expect(parseVolume(value)).toBe(expected);
    });

    it.each([["-0.1"], [1.01], ["2"], ["loud"], [true], [NaN]])(
        "refuses %j",
        (value) => {
            expect(() => parseVolume(value)).toThrow(
                SoundboardVolumeInvalidError
            );
        }
    );
});
