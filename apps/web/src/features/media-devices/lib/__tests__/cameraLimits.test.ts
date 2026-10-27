import { describe, expect, it } from "vitest";
import {
    deviceLimitFor,
    roomLimitFor,
    smallestResolution,
} from "@/features/media-devices/lib/cameraLimits";

describe("roomLimitFor", () => {
    it("allows full HD in a small space", () => {
        expect(roomLimitFor(5, "1080p")).toBe("1080p");
    });

    it("drops to 720p and then 480p as the space fills", () => {
        expect(roomLimitFor(12, "1080p")).toBe("720p");
        expect(roomLimitFor(40, "720p")).toBe("480p");
    });

    it("holds the limit until the count falls clearly below it", () => {
        expect(roomLimitFor(8, "1080p")).toBe("1080p");
        expect(roomLimitFor(8, "720p")).toBe("720p");
        expect(roomLimitFor(6, "720p")).toBe("1080p");
    });
});

describe("deviceLimitFor", () => {
    it("trusts a machine with many cores", () => {
        expect(deviceLimitFor({ cores: 16, memoryGb: 8 })).toBe("1080p");
    });

    it("keeps a weak machine at 720p", () => {
        expect(deviceLimitFor({ cores: 4 })).toBe("720p");
        expect(deviceLimitFor({ cores: 8, memoryGb: 4 })).toBe("720p");
    });

    it("trusts a machine that hides its hints", () => {
        expect(deviceLimitFor({})).toBe("1080p");
    });
});

describe("smallestResolution", () => {
    it("returns the smaller one", () => {
        expect(smallestResolution("1080p", "720p", "480p")).toBe("480p");
        expect(smallestResolution("360p", "1080p")).toBe("360p");
    });
});
