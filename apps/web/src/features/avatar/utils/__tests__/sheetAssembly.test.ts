import { describe, expect, it } from "vitest";
import { AVATAR_SHEET_BYTES, assembleSheet } from "@standin/contracts";
import { assembleSheetIncremental } from "../sheetAssembly";

const layer = (seed: number): Uint8Array => {
    const data = new Uint8Array(AVATAR_SHEET_BYTES);
    let state = seed;
    for (let index = 0; index < data.length; index++) {
        state = (state * 1103515245 + 12345) % 2147483648;
        data[index] = state % 256;
    }
    return data;
};

describe("assembleSheetIncremental", () => {
    const body = layer(1);
    const shirt = layer(2);
    const otherShirt = layer(3);
    const hat = layer(4);

    it("gives the bytes of the full assembly", () => {
        const layers = [{ rgba: body }, { rgba: shirt }, { rgba: hat }];
        expect(
            Buffer.from(assembleSheetIncremental(layers)).equals(
                Buffer.from(assembleSheet(layers))
            )
        ).toBe(true);
    });

    it("still matches when one layer in the middle changes", () => {
        assembleSheetIncremental([
            { rgba: body },
            { rgba: shirt },
            { rgba: hat },
        ]);
        const next = [{ rgba: body }, { rgba: otherShirt }, { rgba: hat }];

        expect(
            Buffer.from(assembleSheetIncremental(next)).equals(
                Buffer.from(assembleSheet(next))
            )
        ).toBe(true);
    });

    it("still matches when a layer is removed or added", () => {
        assembleSheetIncremental([{ rgba: body }, { rgba: shirt }]);
        const fewer = [{ rgba: body }];
        const more = [{ rgba: body }, { rgba: shirt }, { rgba: hat }];

        expect(
            Buffer.from(assembleSheetIncremental(fewer)).equals(
                Buffer.from(assembleSheet(fewer))
            )
        ).toBe(true);
        expect(
            Buffer.from(assembleSheetIncremental(more)).equals(
                Buffer.from(assembleSheet(more))
            )
        ).toBe(true);
    });

    it("does not change the sheet it handed out before", () => {
        const first = assembleSheetIncremental([{ rgba: body }]);
        const copy = first.slice();
        assembleSheetIncremental([{ rgba: body }, { rgba: shirt }]);

        expect(Buffer.from(first).equals(Buffer.from(copy))).toBe(true);
    });

    it("gives a transparent sheet without layers", () => {
        const sheet = assembleSheetIncremental([]);
        expect(sheet.every((byte) => byte === 0)).toBe(true);
    });
});
