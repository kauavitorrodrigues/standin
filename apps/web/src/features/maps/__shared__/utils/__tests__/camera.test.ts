import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import { EDITOR_ZOOM_DIRECTIONS } from "@/features/maps/__shared__/consts/camera";
import { getCameraBounds } from "@/features/maps/__shared__/utils/getCameraBounds";
import { getFitZoom } from "@/features/maps/__shared__/utils/getFitZoom";
import { getNextZoom } from "@/features/maps/__shared__/utils/getNextZoom";
import { clampZoom } from "@/features/maps/__shared__/utils/clampZoom";

describe("getFitZoom", () => {
    it("takes the largest level where the map fits", () => {
        const fit = (viewWidth: number, viewHeight: number) =>
            getFitZoom({
                mapWidth: 320,
                mapHeight: 320,
                viewWidth,
                viewHeight,
            });

        expect(fit(1000, 1000)).toBe(3);
        expect(fit(1000, 700)).toBe(2);
        expect(fit(330, 330)).toBe(1);
    });

    it("falls back to the smallest level when the map never fits", () => {
        expect(
            getFitZoom({
                mapWidth: 3200,
                mapHeight: 3200,
                viewWidth: 800,
                viewHeight: 600,
            })
        ).toBe(1);
    });
});

describe("getNextZoom", () => {
    it("steps through the levels", () => {
        expect(getNextZoom(1, EDITOR_ZOOM_DIRECTIONS.IN)).toBe(2);
        expect(getNextZoom(3, EDITOR_ZOOM_DIRECTIONS.OUT)).toBe(2);
    });

    it("stays at the ends", () => {
        expect(getNextZoom(3, EDITOR_ZOOM_DIRECTIONS.IN)).toBe(3);
        expect(getNextZoom(1, EDITOR_ZOOM_DIRECTIONS.OUT)).toBe(1);
        expect(getNextZoom(2, EDITOR_ZOOM_DIRECTIONS.NEUTRAL)).toBe(2);
    });
});

describe("getCameraBounds", () => {
    it("adds a margin of 2 tiles when the map is larger than the view", () => {
        const margin = 2 * TILE_SIZE;
        const bounds = getCameraBounds({
            mapWidth: 3200,
            mapHeight: 3200,
            viewWidth: 800,
            viewHeight: 600,
            zoom: 1,
        });

        expect(bounds).toEqual({
            x: -margin,
            y: -margin,
            width: 3200 + margin * 2,
            height: 3200 + margin * 2,
        });
    });

    it("grows to the view and centers a map smaller than it", () => {
        const bounds = getCameraBounds({
            mapWidth: 320,
            mapHeight: 320,
            viewWidth: 1000,
            viewHeight: 800,
            zoom: 1,
        });

        expect(bounds).toEqual({ x: -340, y: -240, width: 1000, height: 800 });
    });

    it("measures the view in world px, so a higher zoom needs less room", () => {
        const bounds = getCameraBounds({
            mapWidth: 320,
            mapHeight: 320,
            viewWidth: 1000,
            viewHeight: 800,
            zoom: 2,
        });

        expect(bounds.width).toBe(500);
        expect(bounds.height).toBe(448);
    });
});

describe("clampZoom", () => {
    it("keeps the zoom between the first and the last level", () => {
        expect(clampZoom(0.2)).toBe(1);
        expect(clampZoom(2.5)).toBe(2.5);
        expect(clampZoom(1.14108319)).toBe(1.14);
        expect(clampZoom(10)).toBe(3);
    });
});

describe("getNextZoom between levels", () => {
    it("steps to the nearest level on that side", () => {
        expect(getNextZoom(1.4, EDITOR_ZOOM_DIRECTIONS.IN)).toBe(2);
        expect(getNextZoom(1.4, EDITOR_ZOOM_DIRECTIONS.OUT)).toBe(1);
    });
});
