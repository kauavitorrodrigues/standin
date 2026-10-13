import { describe, expect, it } from "vitest";
import { buildAssetData } from "../buildData";
import { createValues } from "./fixtures";

describe("buildAssetData", () => {
    it("leaves the key to the server and keeps the category of a DECORATION", () => {
        const data = buildAssetData(createValues());
        expect(data).not.toHaveProperty("key");
        expect(data).toMatchObject({
            name: "Caneca",
            type: "DECORATION",
            category: "FOOD_DRINK",
            footprint: { w: 1, h: 1, offsetX: 0 },
            color: null,
            animation: null,
        });
    });

    it("leaves the category out when it is the default of the type", () => {
        const data = buildAssetData(
            createValues({ type: "CHAIR", category: "" })
        );
        expect(data).not.toHaveProperty("category");
    });

    it("sends the color", () => {
        const data = buildAssetData(
            createValues({ colorKey: "red", colorHex: "#D64545" })
        );
        expect(data.color).toEqual({ key: "red", hex: "#D64545" });
    });

    it("sends the animation with an infinite loop as -1", () => {
        const data = buildAssetData(
            createValues({
                isAnimated: true,
                frameCount: 6,
                frameDurationMs: 100,
                loopForever: true,
            })
        );
        expect(data.animation).toEqual({
            frameCount: 6,
            frameDurationMs: 100,
            repeat: -1,
        });
    });

    it("sends a finite repeat count", () => {
        const data = buildAssetData(
            createValues({
                isAnimated: true,
                frameCount: 4,
                frameDurationMs: 80,
                loopForever: false,
                repeatCount: 2,
            })
        );
        expect(data.animation?.repeat).toBe(2);
    });
});
