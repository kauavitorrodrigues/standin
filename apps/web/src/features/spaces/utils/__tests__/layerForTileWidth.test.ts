import { describe, expect, it } from "vitest";
import { layerForTileWidth } from "@/features/spaces/utils/layerForTileWidth";

describe("layerForTileWidth", () => {
    it("uses the low layer for a small tile", () => {
        expect(layerForTileWidth(0, 1)).toBe("low");
        expect(layerForTileWidth(239, 1)).toBe("low");
    });

    it("uses the mid layer from 240 up to 559 real pixels", () => {
        expect(layerForTileWidth(240, 1)).toBe("mid");
        expect(layerForTileWidth(559, 1)).toBe("mid");
    });

    it("uses the high layer from 560 real pixels", () => {
        expect(layerForTileWidth(560, 1)).toBe("high");
        expect(layerForTileWidth(1200, 1)).toBe("high");
    });

    it("counts the device pixel ratio", () => {
        expect(layerForTileWidth(120, 2)).toBe("mid");
        expect(layerForTileWidth(280, 2)).toBe("high");
        expect(layerForTileWidth(100, 2)).toBe("low");
    });
});
