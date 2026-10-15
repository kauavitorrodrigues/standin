import type { PlacedAsset } from "@standin/contracts";

/**
 * Orders the objects so a parent that is also in the list comes before its
 * children. The order among unrelated objects is kept.
 */
export const sortParentsFirst = (items: PlacedAsset[]): PlacedAsset[] => {
    const byId = new Map(items.map((item) => [item.id, item]));
    const sorted: PlacedAsset[] = [];
    const visited = new Set<string>();

    const visit = (item: PlacedAsset) => {
        if (visited.has(item.id)) return;
        visited.add(item.id);

        const parent = item.parentId ? byId.get(item.parentId) : undefined;
        if (parent) visit(parent);

        sorted.push(item);
    };

    items.forEach(visit);

    return sorted;
};
