import { afterEach, describe, expect, it, vi } from "vitest";
import { createChimeUrl } from "../createChimeUrl";

const capture = () => {
    const spy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:chime");
    return () => spy.mock.calls[0]?.[0] as Blob;
};

afterEach(() => vi.restoreAllMocks());

describe("createChimeUrl", () => {
    it("lasts until the end of the last note", async () => {
        const blob = capture();
        const url = createChimeUrl([
            {
                frequencyHz: 440,
                startSeconds: 0,
                durationSeconds: 0.2,
                gain: 1,
            },
            {
                frequencyHz: 880,
                startSeconds: 0.1,
                durationSeconds: 0.3,
                gain: 1,
            },
        ]);

        expect(url).toBe("blob:chime");
        // 0.4 s of 16 bit mono samples at 22050 Hz, plus the 44 byte header.
        expect(blob().size).toBe(44 + Math.round(22050 * 0.4) * 2);
    });

    it("rings: the sound is not silent and starts and ends softly", async () => {
        const blob = capture();
        createChimeUrl([
            {
                frequencyHz: 660,
                startSeconds: 0,
                durationSeconds: 0.2,
                gain: 1,
            },
        ]);

        const view = new DataView(await blob().arrayBuffer());
        const sampleCount = (view.byteLength - 44) / 2;
        const peak = Math.max(
            ...Array.from({ length: sampleCount }, (_, index) =>
                Math.abs(view.getInt16(44 + index * 2, true))
            )
        );

        expect(peak).toBeGreaterThan(1000);
        expect(Math.abs(view.getInt16(44, true))).toBeLessThan(50);
        expect(
            Math.abs(view.getInt16(44 + (sampleCount - 1) * 2, true))
        ).toBeLessThan(50);
    });
});
