import { describe, expect, it } from "vitest";
import { FLOOR_MATERIALS } from "@standin/contracts";
import { FOOTSTEP_TAKE_COUNT } from "@/features/game/consts/footsteps";
import { getFootstepUrl } from "../getFootstepUrl";

describe("getFootstepUrl", () => {
    it("names the file by material and a two digit take", () => {
        expect(getFootstepUrl("WOOD", 1)).toBe("/sounds/footsteps/wood-02.mp3");
        expect(getFootstepUrl("CARPET", 0)).toBe(
            "/sounds/footsteps/carpet-01.mp3"
        );
    });

    it("has a url for every take of every material", () => {
        const urls = Object.values(FLOOR_MATERIALS).flatMap((material) =>
            Array.from({ length: FOOTSTEP_TAKE_COUNT }, (_, take) =>
                getFootstepUrl(material, take)
            )
        );

        expect(new Set(urls).size).toBe(
            Object.keys(FLOOR_MATERIALS).length * FOOTSTEP_TAKE_COUNT
        );
    });
});
