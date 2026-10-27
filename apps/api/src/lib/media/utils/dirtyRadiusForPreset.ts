import { radiiForPreset } from "@standin/media";
import type { ProximityPreset } from "@standin/contracts";

/**
 * People within this distance of a mover may need a new plan. It is the exit
 * radius of the preset of the space, the furthest a person can still be heard
 * or seen from (414 px for Long, 190 px for Short).
 */
export const dirtyRadiusForPreset = (preset: ProximityPreset): number =>
    radiiForPreset(preset).exitRadius;
