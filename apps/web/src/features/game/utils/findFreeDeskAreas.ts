import type { HoverTarget } from "@/features/game/types/hover";

type Claim = { mapAssetId: string };

/** The desk areas nobody holds. */
export const findFreeDeskAreas = (
    areas: readonly HoverTarget[],
    claims: readonly Claim[]
): HoverTarget[] => {
    const claimed = new Set(claims.map((claim) => claim.mapAssetId));
    return areas.filter((area) => !claimed.has(area.id));
};
