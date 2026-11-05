import { describe, expect, it, vi } from "vitest";
import type { FloorMaterial } from "@standin/contracts";
import { FOOTSTEP_THROTTLE_MS } from "@/features/game/consts/footsteps";
import { FootstepPicker } from "../FootstepPicker";
import { Footsteps } from "../Footsteps";

const setup = (material: FloorMaterial = "STONE") => {
    const play = vi.fn();
    const getMaterial = vi.fn(() => material);
    const footsteps = new Footsteps({
        picker: new FootstepPicker(4),
        getMaterial,
        play,
        random: () => 0,
    });
    return { footsteps, play, getMaterial };
};

const feet = { x: 40, y: 70 };

describe("Footsteps", () => {
    it("plays a take of the floor under the feet at the given volume", () => {
        const { footsteps, play, getMaterial } = setup("GRASS");

        footsteps.step("a", feet, 0, 0.6);

        expect(getMaterial).toHaveBeenCalledWith(feet);
        expect(play).toHaveBeenCalledWith("GRASS", 0, 0.6);
    });

    it("plays nothing at zero volume and keeps the throttle free", () => {
        const { footsteps, play } = setup();

        footsteps.step("a", feet, 0, 0);
        expect(play).not.toHaveBeenCalled();

        footsteps.step("a", feet, 10, 0.5);
        expect(play).toHaveBeenCalledTimes(1);
    });

    it("plays nothing for a volume that is not a number", () => {
        const { footsteps, play } = setup();

        footsteps.step("a", feet, 0, Number.NaN);

        expect(play).not.toHaveBeenCalled();
    });

    it("throttles the steps of a person", () => {
        const { footsteps, play } = setup();

        footsteps.step("a", feet, 0, 0.5);
        footsteps.step("a", feet, FOOTSTEP_THROTTLE_MS - 1, 0.5);
        footsteps.step("a", feet, FOOTSTEP_THROTTLE_MS, 0.5);

        expect(play).toHaveBeenCalledTimes(2);
    });

    it("lets two people step at the same time", () => {
        const { footsteps, play } = setup();

        footsteps.step("a", feet, 0, 0.5);
        footsteps.step("b", feet, 0, 0.5);

        expect(play).toHaveBeenCalledTimes(2);
    });

    it("looks the floor up only for a step that sounds", () => {
        const { footsteps, getMaterial } = setup();

        footsteps.step("a", feet, 0, 0.5);
        footsteps.step("a", feet, 10, 0.5);

        expect(getMaterial).toHaveBeenCalledTimes(1);
    });
});
