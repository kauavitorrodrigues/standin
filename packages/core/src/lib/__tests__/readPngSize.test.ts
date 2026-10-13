import { describe, expect, it } from "vitest";
import { encodePng } from "../../features/assets/library/utils/encodePng";
import { readPngSize } from "../readPngSize";

const png = () =>
    encodePng(
        48,
        32,
        Array.from({ length: 48 * 32 }, () => [1, 2, 3, 255])
    );

describe("readPngSize", () => {
    it("reads the size from the header of a PNG", () => {
        expect(readPngSize(png())).toEqual({ width: 48, height: 32 });
    });

    it("returns null for anything that is not a PNG", () => {
        expect(
            readPngSize(Buffer.from("definitely not a png file, just text"))
        ).toBeNull();
        expect(readPngSize(Buffer.alloc(4))).toBeNull();
    });

    it("checks the whole 8 byte signature, not only the first bytes", () => {
        const damaged = Buffer.from(png());
        damaged[5] = 0x00;

        expect(readPngSize(damaged)).toBeNull();
    });

    it("checks that the first chunk is IHDR", () => {
        const damaged = Buffer.from(png());
        damaged.write("IDAT", 12, "ascii");

        expect(readPngSize(damaged)).toBeNull();
    });
});
