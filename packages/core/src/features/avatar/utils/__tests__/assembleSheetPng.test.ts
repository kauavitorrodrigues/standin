import { describe, expect, it } from "vitest";
import { AVATAR_SLOTS } from "@standin/contracts";
import { decodePng } from "../../../../lib/decodePng";
import { assembleSheetPng } from "../assembleSheetPng";
import { sheetPixels } from "./fixtures";

const skin = () => ({
    slot: AVATAR_SLOTS.SKIN,
    front: sheetPixels([200, 150, 100, 255]),
});

const firstPixel = (png: Buffer) => Array.from(decodePng(png).data.slice(0, 4));

describe("assembleSheetPng", () => {
    it("gives the same bytes for the same parts", () => {
        const parts = [
            skin(),
            {
                slot: AVATAR_SLOTS.HAIR,
                front: sheetPixels([255, 255, 255, 255]),
            },
        ];

        expect(assembleSheetPng(parts).equals(assembleSheetPng(parts))).toBe(
            true
        );
    });

    it("draws the front of the later slot over the earlier one", () => {
        const png = assembleSheetPng([
            skin(),
            {
                slot: AVATAR_SLOTS.HAIR,
                front: sheetPixels([1, 2, 3, 255]),
            },
        ]);

        expect(firstPixel(png)).toEqual([1, 2, 3, 255]);
    });

    it("draws the base under the front sheets", () => {
        const base = sheetPixels([40, 50, 60, 255]);
        const parts = [
            {
                slot: AVATAR_SLOTS.OTHER,
                front: sheetPixels([0, 0, 0, 0]),
            },
        ];

        expect(firstPixel(assembleSheetPng(parts, base))).toEqual([
            40, 50, 60, 255,
        ]);

        const withFront = assembleSheetPng(
            [
                ...parts,
                {
                    slot: AVATAR_SLOTS.TOP,
                    front: sheetPixels([1, 2, 3, 255]),
                },
            ],
            base
        );
        expect(firstPixel(withFront)).toEqual([1, 2, 3, 255]);
    });

    it("does not draw the base under a costume", () => {
        const png = assembleSheetPng(
            [
                {
                    slot: AVATAR_SLOTS.COSTUME,
                    front: sheetPixels([0, 0, 0, 0]),
                },
            ],
            sheetPixels([40, 50, 60, 255])
        );

        expect(firstPixel(png)).toEqual([0, 0, 0, 0]);
    });

    it("changes the bytes when the base changes", () => {
        // A transparent front lets the base show through.
        const clear = [
            {
                slot: AVATAR_SLOTS.SKIN,
                front: sheetPixels([0, 0, 0, 0]),
            },
        ];
        const plain = assembleSheetPng(clear, sheetPixels([1, 1, 1, 255]));
        const other = assembleSheetPng(clear, sheetPixels([2, 2, 2, 255]));

        expect(plain.equals(other)).toBe(false);
    });
});
