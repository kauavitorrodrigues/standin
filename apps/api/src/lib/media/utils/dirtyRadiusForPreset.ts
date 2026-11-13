import { ambientRadii, radiiForPreset } from "@standin/media";
import type { AmbientRange, ProximityPreset } from "@standin/contracts";

/**
 * People within this distance of a mover may need a new plan. It is the exit
 * radius of the furthest ring of the space, the furthest a person can still be
 * heard or seen from: the proximity ring (414 px for Long, 190 px for Short),
 * or the ambient ring beyond it when there is one.
 */
export const dirtyRadiusForPreset = (
    preset: ProximityPreset,
    range: AmbientRange = "off"
): number =>
    Math.max(
        radiiForPreset(preset).exitRadius,
        ambientRadii(preset, range).exitRadius
    );
