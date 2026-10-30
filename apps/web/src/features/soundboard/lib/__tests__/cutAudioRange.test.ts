import { describe, expect, it } from "vitest";
import { cutAudioRange } from "../cutAudioRange";
import type { DecodedSource } from "../../types/audio";

// 1000 Hz sample rate so one sample is one millisecond.
const SAMPLE_RATE = 1000;

const ramp = (length: number): Float32Array<ArrayBuffer> =>
    Float32Array.from({ length }, (_, index) => index);

const makeSource = (channels: Float32Array<ArrayBuffer>[]): DecodedSource => {
    const length = channels[0]?.length ?? 0;
    return { channels, sampleRate: SAMPLE_RATE, length, durationMs: length };
};

describe("cutAudioRange", () => {
    it("cuts exactly the samples of the range", () => {
        const cut = cutAudioRange(makeSource([ramp(100)]), {
            startMs: 10,
            endMs: 20,
        });

        expect(cut.length).toBe(10);
        expect(cut.at(0)).toBe(10);
        expect(cut.at(-1)).toBe(19);
    });

    it("mixes channels down to mono by averaging", () => {
        const left = Float32Array.from([1, 1, 1, 1]);
        const right = Float32Array.from([0, 0, 0, 0]);

        const cut = cutAudioRange(makeSource([left, right]), {
            startMs: 0,
            endMs: 4,
        });

        expect([...cut]).toEqual([0.5, 0.5, 0.5, 0.5]);
    });

    it("clamps a range that goes past the source", () => {
        const cut = cutAudioRange(makeSource([ramp(50)]), {
            startMs: -10,
            endMs: 500,
        });

        expect(cut.length).toBe(50);
    });

    it("returns the whole source for a range that spans it", () => {
        const cut = cutAudioRange(makeSource([ramp(50)]), {
            startMs: 0,
            endMs: 50,
        });

        expect(cut.length).toBe(50);
        expect(cut.at(-1)).toBe(49);
    });

    it("returns nothing for an empty or inverted range", () => {
        const source = makeSource([ramp(50)]);

        expect(cutAudioRange(source, { startMs: 20, endMs: 20 }).length).toBe(
            0
        );
        expect(cutAudioRange(source, { startMs: 30, endMs: 10 }).length).toBe(
            0
        );
    });

    it("returns nothing for a range entirely after the end", () => {
        const cut = cutAudioRange(makeSource([ramp(50)]), {
            startMs: 80,
            endMs: 90,
        });

        expect(cut.length).toBe(0);
    });

    it("returns nothing for a source without channels", () => {
        const cut = cutAudioRange(makeSource([]), { startMs: 0, endMs: 10 });

        expect(cut.length).toBe(0);
    });
});
