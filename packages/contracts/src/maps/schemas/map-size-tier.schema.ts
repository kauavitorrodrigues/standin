import { z } from "zod/v4";
import { MAP_SIZE_TIERS } from "../enums/map-size-tier";
import { ENABLED_SIZE_TIERS } from "../consts/size-tiers";
import { MapErrorMessages } from "./consts/error-messages";

export const MapSizeTierSchema = z.enum(MAP_SIZE_TIERS, {
    error: MapErrorMessages.sizeTier.invalid,
});

export const EnabledMapSizeTierSchema = MapSizeTierSchema.refine(
    (tier) => ENABLED_SIZE_TIERS.includes(tier),
    { error: MapErrorMessages.sizeTier.disabled }
);
