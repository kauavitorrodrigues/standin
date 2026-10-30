import { describe, expect, it } from "vitest";
import { encodeMp3Samples } from "../encodeMp3";

const SAMPLE_RATE = 44100;

const sine = (seconds: number): Float32Array =>
    Float32Array.from(
        { length: Math.round(SAMPLE_RATE * seconds) },
        (_, index) => Math.sin((2 * Math.PI * 440 * index) / SAMPLE_RATE) * 0.5
    );

describe("encodeMp3Samples", () => {
    it("writes an mp3 stream that starts with a frame sync", () => {
        const bytes = encodeMp3Samples(sine(0.5), SAMPLE_RATE);

        expect(bytes.length).toBeGreaterThan(0);
        expect(bytes[0]).toBe(0xff);
        expect((bytes[1]! & 0xe0) === 0xe0).toBe(true);
    });

    it("stays near the estimated size for the duration", () => {
        const bytes = encodeMp3Samples(sine(1), SAMPLE_RATE);

        // 128 kbps is 16000 bytes per second.
        expect(bytes.length).toBeGreaterThan(14000);
        expect(bytes.length).toBeLessThan(18000);
    });
});
