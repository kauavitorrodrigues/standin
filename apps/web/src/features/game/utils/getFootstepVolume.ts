import { TILE_SIZE, type ProximityPreset } from "@standin/contracts";
import {
    FOOTSTEP_REACH_TILES,
    FOOTSTEP_VOLUME_SCALE,
} from "@/features/game/consts/footsteps";
import { calculatePresetVolume } from "@/features/game/multiplayer/utils/proximityRadii";

/**
 * The volume (0 to 1) of a step heard at a distance in px: the proximity curve
 * of the preset, scaled down, and silent from the reach of footsteps. A person
 * the rules cannot hear (another private room) is at an infinite distance.
 */
export const getFootstepVolume = (
    distance: number,
    preset: ProximityPreset
): number => {
    if (!(distance < FOOTSTEP_REACH_TILES * TILE_SIZE)) return 0;

    return calculatePresetVolume(preset, distance) * FOOTSTEP_VOLUME_SCALE;
};
