import { MAP_SIZE_TIERS } from "@standin/contracts";
import type { MapSizeTier } from "@standin/contracts";
import { SizeTierInvalidError } from "../../../errors/SizeTierInvalidError";

const SIZE_TIERS: string[] = Object.values(MAP_SIZE_TIERS);

// The value of --size-tier: one of the tiers of the maps, in any case.
export const parseSizeTier = (value: string): MapSizeTier => {
    const tier: string = value.trim().toUpperCase();
    if (!SIZE_TIERS.includes(tier)) {
        throw new SizeTierInvalidError(SIZE_TIERS.join(", "));
    }
    return tier as MapSizeTier;
};
