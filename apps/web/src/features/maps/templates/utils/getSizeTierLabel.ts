import { SIZE_TIERS, type SizeTier } from "@standin/contracts";

// The tier name followed by the largest map it allows, in tiles.
export const getSizeTierLabel = (tier: SizeTier): string => {
    const { maxWidth, maxHeight } = SIZE_TIERS[tier];
    return `${tier} (até ${maxWidth} x ${maxHeight} tiles)`;
};
