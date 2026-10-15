import { describe, expect, it } from "vitest";
import { getWheelZoomFactor } from "../getWheelZoomFactor";

const wheel = (deltaY: number) => ({ deltaY, deltaMode: 0 }) as WheelEvent;

describe("getWheelZoomFactor", () => {
    it("zooms in turning up and out turning down", () => {
        expect(getWheelZoomFactor(wheel(-100))).toBeGreaterThan(1);
        expect(getWheelZoomFactor(wheel(100))).toBeLessThan(1);
    });

    it("is gentle and grows with how far the wheel turns", () => {
        const notch = getWheelZoomFactor(wheel(-100));
        expect(notch).toBeLessThan(1.2);
        expect(getWheelZoomFactor(wheel(-10))).toBeLessThan(notch);
    });

    it("undoes itself turning back", () => {
        expect(
            getWheelZoomFactor(wheel(-80)) * getWheelZoomFactor(wheel(80))
        ).toBeCloseTo(1);
    });
});
