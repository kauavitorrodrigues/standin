import { isDeepStrictEqual } from "node:util";
import type { EditorModel } from "@standin/contracts";
import type { ModelDiffPlan } from "../types/model-diff-plan";
import { hasPlacedChanged } from "./hasPlacedChanged";
import { sortParentsFirst } from "./sortParentsFirst";

/**
 * What it takes to turn the `before` model into the `after` one, without
 * touching the database.
 */
export const planModelDiff = (
    before: EditorModel,
    after: EditorModel
): ModelDiffPlan => {
    const beforeById = new Map(before.placed.map((item) => [item.id, item]));
    const afterIds = new Set(after.placed.map(({ id }) => id));

    const inserts = after.placed.filter(({ id }) => !beforeById.has(id));
    const updates = after.placed.filter((item) => {
        const previous = beforeById.get(item.id);
        return previous !== undefined && hasPlacedChanged(previous, item);
    });
    const deletes = before.placed
        .filter(({ id }) => !afterIds.has(id))
        .map(({ id }) => id);

    return {
        layoutChanged: !isDeepStrictEqual(before.layout, after.layout),
        inserts: sortParentsFirst(inserts),
        updates,
        deletes,
    };
};
