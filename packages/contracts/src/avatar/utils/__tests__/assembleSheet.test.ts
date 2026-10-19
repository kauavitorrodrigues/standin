import { describe, expect, it } from "vitest";
import { AvatarSheetInvalidSizeError } from "../../errors";
import type { AvatarLayer } from "../../types/layer";
import { AVATAR_SHEET_BYTES, assembleSheet } from "../assembleSheet";
import { compositeOver } from "../compositeOver";
import type { Rgba } from "../compositeOver";

const filled = (pixel: [number, number, number, number]): Uint8Array => {
    const data = new Uint8Array(AVATAR_SHEET_BYTES);
    for (let offset = 0; offset < data.length; offset += 4) {
        data.set(pixel, offset);
    }
    return data;
};

const pixelAt = (data: Uint8Array, index: number) =>
    Array.from(data.slice(index * 4, index * 4 + 4));

describe("assembleSheet", () => {
    it("returns a transparent sheet without layers", () => {
        const sheet = assembleSheet([]);
        expect(sheet).toHaveLength(AVATAR_SHEET_BYTES);
        expect(sheet.every((byte) => byte === 0)).toBe(true);
    });

    it("puts the later layer over the earlier one", () => {
        const bottom = filled([10, 20, 30, 255]);
        const top = new Uint8Array(AVATAR_SHEET_BYTES);
        top.set([200, 100, 50, 255], 0);

        const sheet = assembleSheet([{ rgba: bottom }, { rgba: top }]);

        expect(pixelAt(sheet, 0)).toEqual([200, 100, 50, 255]);
        expect(pixelAt(sheet, 1)).toEqual([10, 20, 30, 255]);
    });

    it("is deterministic for the same input", () => {
        const layers: AvatarLayer[] = [
            { rgba: filled([90, 91, 92, 255]) },
            { rgba: filled([200, 10, 10, 77]) },
        ];
        const first = assembleSheet(layers);
        const second = assembleSheet(layers);
        expect(Buffer.from(first).equals(Buffer.from(second))).toBe(true);
    });

    it("does not change the layers", () => {
        const rgba = filled([255, 255, 255, 255]);
        const copy = rgba.slice();
        assembleSheet([{ rgba }]);
        expect(Buffer.from(rgba).equals(Buffer.from(copy))).toBe(true);
    });

    it("rejects a layer with the wrong size", () => {
        expect(() => assembleSheet([{ rgba: new Uint8Array(16) }])).toThrow(
            AvatarSheetInvalidSizeError
        );
    });

    it("matches compositeOver pixel by pixel", () => {
        const random = (seed: number) => () => {
            seed = (seed * 1103515245 + 12345) % 2147483648;
            return seed % 256;
        };
        const next = random(7);
        const fill = () => {
            const data = new Uint8Array(AVATAR_SHEET_BYTES);
            for (let index = 0; index < data.length; index++) {
                data[index] = next();
            }
            return data;
        };
        const bottom = fill();
        const top = fill();

        const sheet = assembleSheet([{ rgba: bottom }, { rgba: top }]);

        const read = (data: Uint8Array, offset: number): Rgba => [
            data[offset],
            data[offset + 1],
            data[offset + 2],
            data[offset + 3],
        ];
        // A transparent source leaves what is under it as it is.
        const over = (source: Rgba, destination: Rgba): Rgba =>
            source[3] === 0 ? destination : compositeOver(source, destination);
        for (let offset = 0; offset < 4000; offset += 4) {
            const expected = over(
                read(top, offset),
                over(read(bottom, offset), [0, 0, 0, 0])
            );
            expect(Array.from(read(sheet, offset))).toEqual(
                Array.from(expected)
            );
        }
    });
});
