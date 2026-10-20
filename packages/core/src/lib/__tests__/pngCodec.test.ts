import { describe, expect, it } from "vitest";
import { decodePng } from "../decodePng";
import { encodeRgbaPng } from "../encodeRgbaPng";

describe("encodeRgbaPng and decodePng", () => {
    const rgba = new Uint8Array([
        255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 0, 10, 20, 30, 255,
    ]);

    it("round trips the pixels, alpha included", () => {
        const decoded = decodePng(encodeRgbaPng(2, 2, rgba));

        expect(decoded.width).toBe(2);
        expect(decoded.height).toBe(2);
        expect(Array.from(decoded.data)).toEqual(Array.from(rgba));
    });

    it("gives the same bytes for the same pixels", () => {
        expect(
            encodeRgbaPng(2, 2, rgba).equals(encodeRgbaPng(2, 2, rgba))
        ).toBe(true);
    });

    it("throws on bytes that are not a PNG", () => {
        expect(() => decodePng(Buffer.from("nope"))).toThrow();
    });
});
