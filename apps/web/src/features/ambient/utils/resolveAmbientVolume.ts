import { TILE_SIZE, calculateAmbientVolume } from "@standin/contracts";
import { LOWERED_AMBIENT_FACTOR } from "@/features/ambient/consts/ambientSettings";
import type {
    AmbientPosition,
    AmbientVolumeInput,
} from "@/features/ambient/types";

/**
 * Where the person stands in the ring, as the volume the curve gives there:
 * above 0 only inside the ambient ring, whatever the person chose to hear.
 */
export const isInAmbientRing = ({
    preset,
    range,
    distance,
}: AmbientPosition): boolean =>
    calculateAmbientVolume(preset, range, distance / TILE_SIZE) > 0;

/**
 * The volume (0 to 1) a person is played at from the ambient ring. 0 when the
 * listener turned the ring off, quieter when they lowered the background.
 */
export const resolveAmbientVolume = ({
    settings,
    ...position
}: AmbientVolumeInput): number => {
    if (!settings.listenAutomatically) return 0;

    const volume = calculateAmbientVolume(
        position.preset,
        position.range,
        position.distance / TILE_SIZE
    );
    return settings.lowerBackgroundVolume
        ? volume * LOWERED_AMBIENT_FACTOR
        : volume;
};
