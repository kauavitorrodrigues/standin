import type { ModelDesk } from "../../types/model-desk";

/**
 * The claim on an object or on the first object above it in the parent chain,
 * so an item on a claimed desk answers with the claim of the desk. The chain
 * stops on a missing parent and on a cycle.
 */
export const findClaimInChain = (
    desks: ModelDesk[],
    parents: Map<string, string | null>,
    objectId: string | null | undefined
): ModelDesk | undefined => {
    const seen = new Set<string>();
    let current = objectId ?? null;

    while (current !== null && !seen.has(current)) {
        seen.add(current);
        const claim = desks.find(({ mapAssetId }) => mapAssetId === current);
        if (claim) return claim;
        current = parents.get(current) ?? null;
    }

    return undefined;
};
