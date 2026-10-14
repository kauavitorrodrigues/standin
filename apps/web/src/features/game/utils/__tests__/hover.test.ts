import { describe, expect, it } from "vitest";
import { findHoveredTarget, isSameHover, toHoverState } from "../hover";

const box = (id: string, x: number, y: number, size = 10) => ({
    id,
    bounds: { x, y, width: size, height: size },
});

describe("findHoveredTarget", () => {
    it("returns null when the point is outside every target", () => {
        expect(
            findHoveredTarget([box("a", 0, 0)], { x: 50, y: 50 })
        ).toBeNull();
    });

    it("returns the target under the point, edges included", () => {
        expect(findHoveredTarget([box("a", 0, 0)], { x: 10, y: 0 })?.id).toBe(
            "a"
        );
    });

    it("prefers the last of two overlapping targets", () => {
        const targets = [box("a", 0, 0), box("b", 5, 5)];
        expect(findHoveredTarget(targets, { x: 7, y: 7 })?.id).toBe("b");
    });
});

describe("toHoverState", () => {
    it("moves the bounds to the canvas and scales them by the zoom", () => {
        const camera = { worldView: { x: 10, y: 20 }, zoom: 2 };
        expect(toHoverState(box("a", 15, 30), camera as never)).toEqual({
            id: "a",
            screen: { x: 10, y: 20, width: 20, height: 20 },
        });
    });
});

describe("isSameHover", () => {
    const state = { id: "a", screen: { x: 1, y: 2, width: 3, height: 4 } };

    it("treats two nulls as the same", () => {
        expect(isSameHover(null, null)).toBe(true);
    });

    it("detects a change of id or of position", () => {
        expect(isSameHover(state, { ...state, id: "b" })).toBe(false);
        expect(
            isSameHover(state, { ...state, screen: { ...state.screen, y: 9 } })
        ).toBe(false);
    });
});
