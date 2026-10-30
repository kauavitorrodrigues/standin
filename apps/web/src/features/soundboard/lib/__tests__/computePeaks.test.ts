import { describe, expect, it } from "vitest";
import { computePeaks } from "../computePeaks";

describe("computePeaks", () => {
    it("takes the loudest absolute sample of each bucket", () => {
        const channel = Float32Array.from([0.1, -0.5, 0.2, 0.9]);

        const peaks = computePeaks([channel], 2);

        expect(peaks[0]).toBeCloseTo(0.5);
        expect(peaks[1]).toBeCloseTo(0.9);
    });

    it("looks across channels", () => {
        const peaks = computePeaks(
            [Float32Array.from([0.1, 0.1]), Float32Array.from([-0.8, 0.1])],
            1
        );

        expect(peaks[0]).toBeCloseTo(0.8);
    });

    it("returns silence for no samples", () => {
        expect([...computePeaks([], 3)]).toEqual([0, 0, 0]);
    });
});
