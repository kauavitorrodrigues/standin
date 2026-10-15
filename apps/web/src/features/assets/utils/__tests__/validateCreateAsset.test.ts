import { describe, expect, it } from "vitest";
import { validateCreateAsset } from "../validateCreate";
import { createValues } from "./fixtures";

const size = { w: 32, h: 32 };

describe("validateCreateAsset", () => {
    it("accepts a complete static asset", () => {
        expect(validateCreateAsset(createValues(), size)).toEqual({});
    });

    it("asks for the crop and the footprint to be marked", () => {
        const errors = validateCreateAsset(
            createValues({ cropW: 0, cropH: 0, footprintW: 0, footprintH: 0 }),
            size
        );
        expect(errors.cropW).toBeDefined();
        expect(errors.footprintW).toBeDefined();
    });

    it("asks for the PNG and the name", () => {
        const errors = validateCreateAsset(
            createValues({ image: [], name: "" }),
            undefined
        );
        expect(Object.keys(errors).sort()).toEqual(["image", "name"]);
    });

    it("requires a category for a DECORATION, but not for a CHAIR", () => {
        expect(
            validateCreateAsset(createValues({ category: "" }), size).category
        ).toBeDefined();
        expect(
            validateCreateAsset(
                createValues({ type: "CHAIR", category: "" }),
                size
            )
        ).toEqual({});
    });

    it("rejects a frame that is not a multiple of 32", () => {
        const errors = validateCreateAsset(createValues(), { w: 40, h: 32 });
        expect(errors.image).toBeDefined();
    });

    it("rejects a footprint that sticks out of the frame", () => {
        const errors = validateCreateAsset(
            createValues({ footprintW: 2 }),
            size
        );
        expect(errors.footprintW).toBeDefined();
    });

    it("needs the color key and the hex together", () => {
        expect(
            validateCreateAsset(createValues({ colorKey: "red" }), size)
                .colorHex
        ).toBeDefined();
        expect(
            validateCreateAsset(
                createValues({ colorKey: "red", colorHex: "#D64545" }),
                size
            )
        ).toEqual({});
    });

    it("splits an animated strip into frames", () => {
        const animated = createValues({
            isAnimated: true,
            frameCount: 6,
            footprintW: 1,
        });
        expect(validateCreateAsset(animated, { w: 192, h: 64 })).toEqual({});
        expect(
            validateCreateAsset(animated, { w: 100, h: 64 }).frameCount
        ).toBeDefined();
    });

    it("asks for at least two frames and a duration", () => {
        const errors = validateCreateAsset(
            createValues({
                isAnimated: true,
                frameCount: 1,
                frameDurationMs: undefined,
            }),
            size
        );
        expect(Object.keys(errors).sort()).toEqual([
            "frameCount",
            "frameDurationMs",
        ]);
    });
});
