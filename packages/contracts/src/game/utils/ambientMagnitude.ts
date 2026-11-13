import { PROXIMITY_PRESETS } from "../consts/proximity";
import type { ProximityPreset } from "../consts/proximity";
import {
    AMBIENT_EDGE_PROBE_TILES,
    AMBIENT_EDGE_SHARE,
    AMBIENT_FALLOFF_DB,
    AMBIENT_RING_TILES,
    type AmbientRange,
} from "../consts/ambient";
import type { AmbientBand } from "../types/ambient";
import { calculateProximityMagnitude } from "./proximityMagnitude";

/**
 * The ring of an ambient range around a proximity preset, in tiles.
 */
export const getAmbientBand = (
    preset: ProximityPreset,
    range: AmbientRange
): AmbientBand => {
    const innerTiles = PROXIMITY_PRESETS[preset].thresholdTiles;
    return { innerTiles, outerTiles: innerTiles + AMBIENT_RING_TILES[range] };
};

const peaks = new Map<ProximityPreset, number>();

/**
 * The volume the ring starts at: a share of the proximity volume just inside
 * the cutoff of the preset, so stepping out of the proximity ring never makes
 * a voice louder. About 0.15 for Short and 0.05 for Long. Cached per preset,
 * since the volume tick asks for it for every person.
 */
export const getAmbientPeak = (preset: ProximityPreset): number => {
    const cached = peaks.get(preset);
    if (cached !== undefined) return cached;

    const { innerTiles } = getAmbientBand(preset, "short");
    const edge = calculateProximityMagnitude(
        preset,
        innerTiles - AMBIENT_EDGE_PROBE_TILES
    ).audio;
    const peak = edge * AMBIENT_EDGE_SHARE;
    peaks.set(preset, peak);
    return peak;
};

/**
 * The ambient volume (0 to 1) of a person at a distance in tiles. It is 0
 * inside the proximity ring, where the proximity curve decides, and from the
 * outer edge on. In the ring it starts at getAmbientPeak and falls in dB, in a
 * straight line, to AMBIENT_FALLOFF_DB below it at the outer edge.
 */
export const calculateAmbientVolume = (
    preset: ProximityPreset,
    range: AmbientRange,
    tiles: number
): number => {
    const { innerTiles, outerTiles } = getAmbientBand(preset, range);
    if (tiles < innerTiles || tiles >= outerTiles) return 0;

    const share = (tiles - innerTiles) / (outerTiles - innerTiles);
    return getAmbientPeak(preset) * 10 ** (-(AMBIENT_FALLOFF_DB * share) / 20);
};
