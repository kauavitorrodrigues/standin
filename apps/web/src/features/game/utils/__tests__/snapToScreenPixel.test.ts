import { describe, expect, it } from "vitest";
import { snapToScreenPixel } from "../snapToScreenPixel";

describe("snapToScreenPixel", () => {
    it("keeps a scroll that is already on a screen px", () => {
        expect(snapToScreenPixel(10.25, 4)).toBe(10.25);
        expect(snapToScreenPixel(7, 2)).toBe(7);
    });

    it("moves a scroll to the nearest quarter of a world px at zoom 4", () => {
        expect(snapToScreenPixel(10.1, 4)).toBe(10);
        expect(snapToScreenPixel(10.2, 4)).toBe(10.25);
        expect(snapToScreenPixel(10.4, 4)).toBe(10.5);
    });

    it("moves a scroll to the nearest half of a world px at zoom 2", () => {
        expect(snapToScreenPixel(10.2, 2)).toBe(10);
        expect(snapToScreenPixel(10.3, 2)).toBe(10.5);
    });

    it("leaves a whole world px scroll alone at zoom 1 and below", () => {
        expect(snapToScreenPixel(10.4, 1)).toBe(10);
        expect(snapToScreenPixel(10.6, 1)).toBe(11);
    });

    it("always lands on a whole number of screen px", () => {
        [0.5, 1, 2, 3, 4].forEach((zoom) => {
            [0, 3.66, 99.99, 1234.567].forEach((scroll) => {
                const screen = snapToScreenPixel(scroll, zoom) * zoom;
                expect(screen).toBeCloseTo(Math.round(screen), 9);
            });
        });
    });

    it("returns the scroll as it is when the zoom is not positive", () => {
        expect(snapToScreenPixel(5.5, 0)).toBe(5.5);
    });
});
