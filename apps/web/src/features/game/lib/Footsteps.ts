import type { FloorMaterial } from "@standin/contracts";
import type { FootstepPicker } from "@/features/game/lib/FootstepPicker";

type Point = { x: number; y: number };

type FootstepsDeps = {
    picker: FootstepPicker;
    // The floor under the feet of a person (see buildFloorMaterialLookup).
    getMaterial: (feet: Point) => FloorMaterial;
    play: (material: FloorMaterial, take: number, volume: number) => void;
    random: () => number;
};

/**
 * One step of a person: it sounds when the throttle lets it and the volume
 * is above zero, with a take drawn for the floor under the feet. Whether the
 * person is walking and how loud they are for you is up to the caller.
 */
export class Footsteps {
    private readonly deps: FootstepsDeps;

    constructor(deps: FootstepsDeps) {
        this.deps = deps;
    }

    // `now` is the scene time in ms. A silent step does not use up the
    // throttle window, so walking into earshot sounds at once.
    step(playerId: string, feet: Point, now: number, volume: number): void {
        if (!(volume > 0)) return;

        const { picker, getMaterial, play, random } = this.deps;
        const take = picker.pick(playerId, now, random);
        if (take === null) return;

        play(getMaterial(feet), take, volume);
    }

    remove(playerId: string): void {
        this.deps.picker.remove(playerId);
    }

    clear(): void {
        this.deps.picker.clear();
    }
}
