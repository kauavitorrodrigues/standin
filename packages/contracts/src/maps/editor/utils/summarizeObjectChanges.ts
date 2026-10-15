import type { EditorOp } from "../schemas/editorOp.schema";
import type { EditActor } from "../types/edit-actor";
import type { EditorModel } from "../types/editor-model";
import type { ObjectChangeSummary } from "../types/object-change-summary";

/**
 * Counts what a draft of object operations does to the map. Pure. Each object
 * counts once however many operations touch it, an object placed and removed
 * by the same draft counts for nothing, and a moved or replaced object that
 * is removed later counts only as removed. Operations that are not about
 * objects are ignored.
 */
export const summarizeObjectChanges = (
    base: Pick<EditorModel, "placed" | "desks">,
    ops: EditorOp[],
    actor: EditActor
): ObjectChangeSummary => {
    const baseIds = new Set(base.placed.map(({ id }) => id));
    const placed = new Set<string>();
    const moved = new Set<string>();
    const replaced = new Set<string>();
    const removed = new Set<string>();

    for (const op of ops) {
        switch (op.type) {
            case "place_asset":
                placed.add(op.tempId);
                break;
            case "move_asset":
                if (baseIds.has(op.id)) moved.add(op.id);
                break;
            case "replace_asset":
                if (baseIds.has(op.id)) replaced.add(op.id);
                break;
            case "remove_asset":
                if (placed.delete(op.id)) break;
                moved.delete(op.id);
                replaced.delete(op.id);
                if (baseIds.has(op.id)) removed.add(op.id);
                break;
            default:
                break;
        }
    }

    const ownDesks = base.desks
        .filter(
            ({ mapAssetId, userId }) =>
                userId === actor.userId && removed.has(mapAssetId)
        )
        .map(({ mapAssetId }) => mapAssetId);

    const ownDeskItems = base.placed.filter(
        ({ parentId }) => parentId !== null && ownDesks.includes(parentId)
    ).length;

    return {
        placed: placed.size,
        moved: moved.size,
        replaced: replaced.size,
        removed: removed.size,
        ownDeskRemoved: ownDesks.length > 0,
        ownDeskItems,
    };
};
