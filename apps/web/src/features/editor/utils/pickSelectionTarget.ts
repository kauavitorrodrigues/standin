import type { SelectionTarget } from "@/features/editor/types/SelectionTarget";

// The winner among the answers of the providers: the greatest depth, and on
// equal depth the smaller area (so among zones the smallest one wins). The
// first of two equal answers stays.
export const pickSelectionTarget = (
    targets: readonly (SelectionTarget | null)[]
): SelectionTarget | null => {
    let best: SelectionTarget | null = null;

    for (const target of targets) {
        if (!target) continue;
        if (!best || beats(target, best)) best = target;
    }

    return best;
};

const beats = (a: SelectionTarget, b: SelectionTarget): boolean => {
    if (a.depth !== b.depth) return a.depth > b.depth;
    return a.area < b.area;
};
