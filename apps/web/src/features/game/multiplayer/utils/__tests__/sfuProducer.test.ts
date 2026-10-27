import { describe, expect, it } from "vitest";
import {
    applyContentHint,
    encodingTierOf,
    produceOptionsFor,
    screenEncodingsFor,
    screenTierForSize,
} from "../sfuProducer";

const fakeTrack = (settings: MediaTrackSettings) =>
    ({ getSettings: () => settings }) as unknown as MediaStreamTrack;

describe("screenTierForSize", () => {
    it("is HIGH above 1920 px", () => {
        expect(screenTierForSize(2880, 1620)).toBe("HIGH");
    });

    it("is MED up to 1920 px", () => {
        expect(screenTierForSize(1920, 1080)).toBe("MED");
        expect(screenTierForSize(1366, 768)).toBe("MED");
    });

    it("is LOW up to 1280 px or when unknown", () => {
        expect(screenTierForSize(1280, 720)).toBe("LOW");
        expect(screenTierForSize(undefined, undefined)).toBe("LOW");
    });
});

describe("screenEncodingsFor", () => {
    it("raises the bitrate with the tier", () => {
        expect(screenEncodingsFor("LOW", 15)[0].maxBitrate).toBe(1_500_000);
        expect(screenEncodingsFor("MED", 15)[0].maxBitrate).toBe(2_000_000);
        expect(screenEncodingsFor("HIGH", 15)[0].maxBitrate).toBe(2_500_000);
    });

    it("follows the frame rate of the track", () => {
        expect(screenEncodingsFor("MED", 29.97)[0].maxFramerate).toBe(30);
    });

    it("falls back to 15 fps when the track does not say", () => {
        expect(screenEncodingsFor("MED", undefined)[0].maxFramerate).toBe(15);
        expect(screenEncodingsFor("MED", 0)[0].maxFramerate).toBe(15);
    });
});

describe("produceOptionsFor", () => {
    it("sizes a screen by its track", () => {
        const options = produceOptionsFor(
            "screen",
            fakeTrack({ width: 2880, height: 1800, frameRate: 24 })
        );
        expect(options.encodings).toEqual([
            { maxBitrate: 2_500_000, maxFramerate: 24 },
        ]);
    });

    it("keeps the camera simulcast", () => {
        expect(produceOptionsFor("camera").encodings).toHaveLength(3);
    });
});

describe("applyContentHint", () => {
    it("sets music on the audio of a screen", () => {
        const track = { contentHint: "" } as MediaStreamTrack;
        applyContentHint("screen-audio", track);
        expect(track.contentHint).toBe("music");
    });

    it("leaves the video of a screen as captured", () => {
        const track = { contentHint: "motion" } as MediaStreamTrack;
        applyContentHint("screen", track);
        expect(track.contentHint).toBe("motion");
    });
});

describe("camera encodings by capture size", () => {
    it("uses the full HD layers for a capture taller than 720 px", () => {
        const encodings = produceOptionsFor(
            "camera",
            fakeTrack({ width: 1920, height: 1080 })
        ).encodings;

        expect(encodings).toHaveLength(3);
        expect(encodings?.[2]).toMatchObject({
            rid: "high",
            maxBitrate: 3_500_000,
            maxFramerate: 30,
        });
    });

    it("keeps the standard layers for 720p or smaller", () => {
        const encodings = produceOptionsFor(
            "camera",
            fakeTrack({ width: 1280, height: 720 })
        ).encodings;

        expect(encodings?.[2]).toMatchObject({
            maxBitrate: 2_000_000,
            maxFramerate: 24,
        });
    });

    it("names a different tier so the producer is made again", () => {
        const hd = fakeTrack({ height: 720 });
        const fullHd = fakeTrack({ height: 1080 });

        expect(encodingTierOf("camera", hd)).not.toBe(
            encodingTierOf("camera", fullHd)
        );
        expect(encodingTierOf("mic", hd)).toBe("mic");
    });
});
