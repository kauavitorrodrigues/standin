import { describe, expect, it } from "vitest";
import { DEFAULT_SCREEN_SHARE_SETTINGS } from "../../consts/streamingSettings";
import { getIdleGraceMs, getScreenConstraints } from "../screenConstraints";

describe("getScreenConstraints", () => {
    it("keeps the capture the app always had by default", () => {
        expect(getScreenConstraints(DEFAULT_SCREEN_SHARE_SETTINGS)).toEqual({
            width: { max: 1920 },
            height: { max: 1080 },
            frameRate: { ideal: 30, max: 30 },
        });
    });

    it("follows the chosen resolution and frame rate", () => {
        expect(
            getScreenConstraints({
                ...DEFAULT_SCREEN_SHARE_SETTINGS,
                resolution: "720p",
                frameRate: "15",
            })
        ).toEqual({
            width: { max: 1280 },
            height: { max: 720 },
            frameRate: { ideal: 15, max: 15 },
        });
    });
});

describe("getIdleGraceMs", () => {
    it("defaults to a minute", () => {
        expect(getIdleGraceMs(DEFAULT_SCREEN_SHARE_SETTINGS)).toBe(60_000);
    });

    it("is null when the share is never stopped", () => {
        expect(
            getIdleGraceMs({
                ...DEFAULT_SCREEN_SHARE_SETTINGS,
                idleGrace: "never",
            })
        ).toBeNull();
    });
});
