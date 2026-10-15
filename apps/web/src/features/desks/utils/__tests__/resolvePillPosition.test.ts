import { describe, expect, it } from "vitest";
import { resolvePillPosition } from "../resolvePillPosition";

const hover = { screen: { x: 100, y: 200, width: 320, height: 256 } };

describe("resolvePillPosition", () => {
    it("centers over the top edge when above", () => {
        expect(resolvePillPosition(hover, "above")).toEqual({
            left: 260,
            top: 200,
        });
    });

    it("sits at the bottom right corner when below", () => {
        expect(resolvePillPosition(hover, "below")).toEqual({
            left: 420,
            top: 456,
        });
    });
});
