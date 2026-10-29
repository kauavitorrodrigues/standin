import type { HoverTarget } from "@/features/game/types/hover";

type Claim = { mapAssetId: string; userId: string };

/**
 * The desk areas by who holds them: the one of the person, and the ones that
 * somebody else claimed. Free desks are in neither.
 */
export const splitDeskAreas = (
    areas: readonly HoverTarget[],
    claims: readonly Claim[],
    userId: string
): { own: HoverTarget | null; others: HoverTarget[] } => {
    const ownerById = new Map(
        claims.map(({ mapAssetId, userId: owner }) => [mapAssetId, owner])
    );
    let own: HoverTarget | null = null;
    const others: HoverTarget[] = [];

    for (const area of areas) {
        const owner = ownerById.get(area.id);
        if (owner === undefined) continue;
        if (owner === userId) own = area;
        else others.push(area);
    }

    return { own, others };
};
