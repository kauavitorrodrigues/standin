import type { EditorModel, ModelDesk } from "@standin/contracts";

// The desk claimed by someone else that holds the object: the object itself,
// or the first object above it in the chain of parents (an item on a desk).
// Null for a free desk, for the desk of the person and for what is not on a
// desk. The chain stops on a missing parent and on a cycle.
export const findOtherDeskClaim = (
    model: Pick<EditorModel, "placed" | "desks">,
    objectId: string | null | undefined,
    userId: string
): ModelDesk | null => {
    const parents = new Map(
        model.placed.map(({ id, parentId }) => [id, parentId])
    );
    const seen = new Set<string>();
    let current = objectId ?? null;

    while (current !== null && !seen.has(current)) {
        seen.add(current);
        const claim = model.desks.find(
            ({ mapAssetId }) => mapAssetId === current
        );
        if (claim) return claim.userId === userId ? null : claim;
        current = parents.get(current) ?? null;
    }

    return null;
};
