import { describe, expect, it } from "vitest";
import { getAmbientPeak } from "@standin/contracts";
import {
    DEFAULT_AMBIENT_SETTINGS,
    LOWERED_AMBIENT_FACTOR,
} from "../../consts/ambientSettings";
import { parseAmbientSettings } from "../../lib/ambientSettingsPreferences";
import {
    findOverheardPeers,
    findStartedConversations,
} from "../findOverheardPeers";
import { isInAmbientRing, resolveAmbientVolume } from "../resolveAmbientVolume";

// Short preset: the proximity ring ends at 5 tiles (160 px), the short
// ambient ring at 9 tiles.
const at = (tiles: number) => ({
    preset: "Short" as const,
    range: "short" as const,
    distance: tiles * 32,
});

describe("resolveAmbientVolume", () => {
    it("plays the ring at the volume of the curve", () => {
        expect(
            resolveAmbientVolume({
                ...at(5),
                settings: DEFAULT_AMBIENT_SETTINGS,
            })
        ).toBe(getAmbientPeak("Short"));
    });

    it("falls 20 dB at the middle of the ring", () => {
        const volume = resolveAmbientVolume({
            ...at(7),
            settings: DEFAULT_AMBIENT_SETTINGS,
        });

        expect(volume).toBeCloseTo(getAmbientPeak("Short") / 10);
    });

    it("is silent inside the proximity ring and beyond the ring", () => {
        const settings = DEFAULT_AMBIENT_SETTINGS;

        expect(resolveAmbientVolume({ ...at(3), settings })).toBe(0);
        expect(resolveAmbientVolume({ ...at(9), settings })).toBe(0);
    });

    it("is silent when the person does not listen automatically", () => {
        expect(
            resolveAmbientVolume({
                ...at(5),
                settings: {
                    ...DEFAULT_AMBIENT_SETTINGS,
                    listenAutomatically: false,
                },
            })
        ).toBe(0);
    });

    it("is quieter when the background is lowered", () => {
        expect(
            resolveAmbientVolume({
                ...at(5),
                settings: {
                    ...DEFAULT_AMBIENT_SETTINGS,
                    lowerBackgroundVolume: true,
                },
            })
        ).toBeCloseTo(getAmbientPeak("Short") * LOWERED_AMBIENT_FACTOR);
    });

    it("is silent when the range is off", () => {
        expect(
            resolveAmbientVolume({
                ...at(5),
                range: "off",
                settings: DEFAULT_AMBIENT_SETTINGS,
            })
        ).toBe(0);
    });
});

describe("isInAmbientRing", () => {
    it("is true only between the proximity ring and the outer edge", () => {
        expect(isInAmbientRing(at(4))).toBe(false);
        expect(isInAmbientRing(at(6))).toBe(true);
        expect(isInAmbientRing(at(10))).toBe(false);
        expect(isInAmbientRing({ ...at(6), distance: Infinity })).toBe(false);
    });
});

describe("findOverheardPeers", () => {
    const base = {
        preset: "Short" as const,
        range: "short" as const,
        userIds: new Map([
            ["s1", "u1"],
            ["s2", "u2"],
            ["s3", "u3"],
        ]),
        speakingUserIds: new Set(["u1", "u3"]),
    };

    it("keeps the speaking people in the ring", () => {
        const distances = new Map([
            ["s1", 6 * 32],
            ["s2", 6 * 32],
            ["s3", 2 * 32],
        ]);

        expect([...findOverheardPeers({ ...base, distances })]).toEqual(["s1"]);
    });

    it("finds nobody when the range is off", () => {
        const distances = new Map([["s1", 6 * 32]]);

        expect(
            findOverheardPeers({ ...base, range: "off", distances }).size
        ).toBe(0);
    });
});

describe("findStartedConversations", () => {
    it("gives only the people that were not overheard before", () => {
        expect(
            findStartedConversations(new Set(["a"]), new Set(["a", "b"]))
        ).toEqual(["b"]);
        expect(findStartedConversations(new Set(["a"]), new Set())).toEqual([]);
    });
});

describe("parseAmbientSettings", () => {
    it("falls back to the defaults for what is not stored", () => {
        expect(parseAmbientSettings(null)).toEqual(DEFAULT_AMBIENT_SETTINGS);
        expect(parseAmbientSettings({ listenAutomatically: "no" })).toEqual(
            DEFAULT_AMBIENT_SETTINGS
        );
    });

    it("keeps a stored choice", () => {
        expect(
            parseAmbientSettings({
                listenAutomatically: false,
                lowerBackgroundVolume: true,
            })
        ).toEqual({ listenAutomatically: false, lowerBackgroundVolume: true });
    });
});
