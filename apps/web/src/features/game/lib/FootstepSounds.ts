import { FLOOR_MATERIALS, type FloorMaterial } from "@standin/contracts";
import { FOOTSTEP_TAKE_COUNT } from "@/features/game/consts/footsteps";
import { getFootstepUrl } from "@/features/game/utils/getFootstepUrl";
import { SoundEffect } from "@/features/sounds/lib/SoundEffect";

const loadBank = (material: FloorMaterial): readonly SoundEffect[] =>
    Array.from(
        { length: FOOTSTEP_TAKE_COUNT },
        (_, take) => new SoundEffect(getFootstepUrl(material, take))
    );

/**
 * The takes of every floor material, loaded when it is made so the first step
 * does not wait on a download. The files are a few KB each. A take that
 * cannot load stays silent and the walk goes on (see SoundEffect).
 */
export class FootstepSounds {
    private readonly banks: Record<FloorMaterial, readonly SoundEffect[]> = {
        [FLOOR_MATERIALS.CARPET]: loadBank(FLOOR_MATERIALS.CARPET),
        [FLOOR_MATERIALS.WOOD]: loadBank(FLOOR_MATERIALS.WOOD),
        [FLOOR_MATERIALS.STONE]: loadBank(FLOOR_MATERIALS.STONE),
        [FLOOR_MATERIALS.GRASS]: loadBank(FLOOR_MATERIALS.GRASS),
    };

    // `take` is 0-based and `volume` is 0 to 1.
    play(material: FloorMaterial, take: number, volume: number): void {
        const effect = this.banks[material][take];
        if (!effect) return;

        effect.setVolume(volume);
        void effect.play();
    }

    destroy(): void {
        Object.values(this.banks).forEach((bank) =>
            bank.forEach((effect) => effect.destroy())
        );
    }
}
