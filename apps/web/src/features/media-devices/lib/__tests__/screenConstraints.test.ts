import { describe, expect, it } from "vitest";
import { DEFAULT_SCREEN_SHARE_SETTINGS } from "../../consts/streamingSettings";
import {
    getIdleGraceMs,
    getScreenCaptureConstraints,
    getScreenContentHint,
    getScreenTrackConstraints,
} from "../screenConstraints";

describe("getScreenCaptureConstraints", () => {
    it("asks for the highest box with the cursor drawn", () => {
        expect(getScreenCaptureConstraints()).toEqual({
            width: { max: 2880 },
            height: { max: 2880 },
            cursor: "always",
        });
    });
});

describe("getScreenTrackConstraints", () => {
    it("narrows to the MED box at 30 fps by default", () => {
        expect(getScreenTrackConstraints(DEFAULT_SCREEN_SHARE_SETTINGS)).toEqual({
            width: { max: 1920 },
            height: { max: 1920 },
            frameRate: { ideal: 30, max: 30 },
        });
    });

    it("maps 720p to the LOW box and follows the frame rate", () => {
        expect(
            getScreenTrackConstraints({
                ...DEFAULT_SCREEN_SHARE_SETTINGS,
                resolution: "720p",
                frameRate: "15",
            })
        ).toEqual({
            width: { max: 1280 },
            height: { max: 1280 },
            frameRate: { ideal: 15, max: 15 },
        });
    });

    it("uses 24 fps when optimized for video", () => {
        expect(
            getScreenTrackConstraints({
                ...DEFAULT_SCREEN_SHARE_SETTINGS,
                highQuality: true,
            }).frameRate
        ).toEqual({ ideal: 24, max: 24 });
    });
});

describe("getScreenContentHint", () => {
    it("keeps the chosen hint by default", () => {
        expect(getScreenContentHint(DEFAULT_SCREEN_SHARE_SETTINGS)).toBe("motion");
    });

    it("is detail when optimized for video at MED or above", () => {
        expect(
            getScreenContentHint({
                ...DEFAULT_SCREEN_SHARE_SETTINGS,
                highQuality: true,
            })
        ).toBe("detail");
    });

    it("is text when optimized for video at LOW", () => {
        expect(
            getScreenContentHint({
                ...DEFAULT_SCREEN_SHARE_SETTINGS,
                highQuality: true,
                resolution: "720p",
            })
        ).toBe("text");
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
