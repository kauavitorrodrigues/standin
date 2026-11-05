import { describe, expect, it } from "vitest";
import { TILE_SIZE } from "@standin/contracts";
import {
    FOOTSTEP_REACH_TILES,
    FOOTSTEP_VOLUME_SCALE,
} from "@/features/game/consts/footsteps";
import { getFootstepVolume } from "../getFootstepVolume";

describe("getFootstepVolume", () => {
    it("plays your own step at the scaled full volume", () => {
        expect(getFootstepVolume(0, "Long")).toBeCloseTo(FOOTSTEP_VOLUME_SCALE);
    });

    it("follows the curve of the preset, scaled", () => {
        // Long loses 0.1 per tile up to 5 tiles, so 3 tiles is 0.7.
        expect(getFootstepVolume(3 * TILE_SIZE, "Long")).toBeCloseTo(
            0.7 * FOOTSTEP_VOLUME_SCALE
        );
        // Short stays at full strength for the first 2 tiles.
        expect(getFootstepVolume(TILE_SIZE, "Short")).toBeCloseTo(
            FOOTSTEP_VOLUME_SCALE
        );
    });

    it("fades along the curve and never goes above the scale", () => {
        const near = getFootstepVolume(6 * TILE_SIZE, "Long");
        const far = getFootstepVolume(8 * TILE_SIZE, "Long");

        expect(near).toBeLessThanOrEqual(FOOTSTEP_VOLUME_SCALE);
        expect(far).toBeGreaterThan(0);
        expect(far).toBeLessThan(near);
    });

    it("is silent from the reach of footsteps, even inside the Long reach", () => {
        const reach = FOOTSTEP_REACH_TILES * TILE_SIZE;

        expect(getFootstepVolume(reach - 1, "Long")).toBeGreaterThan(0);
        expect(getFootstepVolume(reach, "Long")).toBe(0);
        expect(getFootstepVolume(reach + TILE_SIZE, "Long")).toBe(0);
    });

    it("lets the Short preset cut earlier than the reach", () => {
        expect(getFootstepVolume(4 * TILE_SIZE, "Short")).toBeGreaterThan(0);
        expect(getFootstepVolume(5 * TILE_SIZE, "Short")).toBe(0);
        expect(getFootstepVolume(8 * TILE_SIZE, "Short")).toBe(0);
    });

    it("is silent for someone in another private room", () => {
        expect(getFootstepVolume(Number.POSITIVE_INFINITY, "Long")).toBe(0);
    });
});
