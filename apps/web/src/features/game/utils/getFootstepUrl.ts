import type { FloorMaterial } from "@standin/contracts";
import { FOOTSTEP_SOUNDS_PATH } from "@/features/game/consts/footsteps";

// The file of a take (0-based) of a material: `wood-02.mp3` for WOOD, 1.
export const getFootstepUrl = (material: FloorMaterial, take: number): string =>
    `${FOOTSTEP_SOUNDS_PATH}/${material.toLowerCase()}-${String(take + 1).padStart(2, "0")}.mp3`;
