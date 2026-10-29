import { describe, expect, it } from "vitest";
import { DEFAULT_SCREEN_SHARE_SETTINGS } from "../../consts/streamingSettings";
import {
    getIdleGraceMs,
    getScreenAudioConstraints,
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

describe("getScreenAudioConstraints", () => {
    it("turns off the processing meant for a voice, which would spoil music", () => {
        expect(getScreenAudioConstraints()).toMatchObject({
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
        });
    });

    it("keeps the sharing tab from playing the sound back to the person", () => {
        expect(getScreenAudioConstraints()).toMatchObject({
            suppressLocalAudioPlayback: true,
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

describe("HD off", () => {
    const high = { ...DEFAULT_SCREEN_SHARE_SETTINGS, resolution: "2880p" as const };

    it("uses the HIGH box when HD is allowed", () => {
        expect(getScreenTrackConstraints(high).width).toEqual({ max: 2880 });
    });

    it("falls back to the MED box when HD is off", () => {
        expect(getScreenTrackConstraints(high, false).width).toEqual({ max: 1920 });
    });

    it("keeps LOW when HD is off", () => {
        expect(
            getScreenTrackConstraints(
                { ...DEFAULT_SCREEN_SHARE_SETTINGS, resolution: "720p" },
                false
            ).width
        ).toEqual({ max: 1280 });
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

describe("getScreenContentHint with HD off", () => {
    it("stays detail at MED when optimized for video", () => {
        expect(
            getScreenContentHint(
                { ...DEFAULT_SCREEN_SHARE_SETTINGS, highQuality: true, resolution: "2880p" },
                false
            )
        ).toBe("detail");
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
