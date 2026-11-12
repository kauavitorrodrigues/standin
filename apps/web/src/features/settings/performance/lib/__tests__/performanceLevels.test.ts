import { describe, expect, it } from "vitest";
import {
    DEFAULT_PERFORMANCE_LEVEL,
    PERFORMANCE_LEVEL_IDS,
} from "../../consts/performanceLevels";
import { DEFAULT_PERFORMANCE_SETTINGS } from "../../consts/performanceSettings";
import { getDegradedSettings } from "../degradation/DegradationEffects";
import {
    getLevelSettings,
    getLevelTeleport,
    getPerformanceLevel,
} from "../performanceLevels";

describe("performance levels", () => {
    it("gives each level exactly its set of knobs", () => {
        expect(getLevelSettings("best")).toEqual({
            fpsLimit: "auto",
            reduceMotion: false,
        });
        expect(getLevelSettings("balanced")).toEqual({
            fpsLimit: "60",
            reduceMotion: false,
        });
        expect(getLevelSettings("low")).toEqual({
            fpsLimit: "30",
            reduceMotion: false,
        });
        expect(getLevelSettings("powerSaver")).toEqual({
            fpsLimit: "30",
            reduceMotion: true,
        });
    });

    it("returns a copy so callers cannot change a preset", () => {
        expect(getLevelSettings("best")).not.toBe(getLevelSettings("best"));
    });

    it("defaults to the level that keeps today's behavior", () => {
        expect(getLevelSettings(DEFAULT_PERFORMANCE_LEVEL)).toEqual(
            DEFAULT_PERFORMANCE_SETTINGS
        );
        expect(getPerformanceLevel(DEFAULT_PERFORMANCE_SETTINGS, true)).toBe(
            DEFAULT_PERFORMANCE_LEVEL
        );
    });

    it("reads back the level of every preset", () => {
        PERFORMANCE_LEVEL_IDS.forEach((level) =>
            expect(
                getPerformanceLevel(
                    getLevelSettings(level),
                    getLevelTeleport(level)
                )
            ).toBe(level)
        );
    });

    it("is custom when the knobs match no level", () => {
        expect(
            getPerformanceLevel({ fpsLimit: "auto", reduceMotion: true }, true)
        ).toBe("custom");
        expect(
            getPerformanceLevel({ fpsLimit: "60", reduceMotion: true }, true)
        ).toBe("custom");
    });

    it("only power saver turns teleport off", () => {
        expect(
            PERFORMANCE_LEVEL_IDS.filter((level) => !getLevelTeleport(level))
        ).toEqual(["powerSaver"]);
    });

    it("is custom when only the teleport differs from a level", () => {
        expect(getPerformanceLevel(getLevelSettings("best"), false)).toBe(
            "custom"
        );
    });

    it("degradation lowers to the power saver level", () => {
        expect(getDegradedSettings()).toEqual(getLevelSettings("powerSaver"));
    });
});
