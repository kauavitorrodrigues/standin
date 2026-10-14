import type { EditorModel, PublishResult } from "@standin/contracts";

// The model the draft becomes once the server accepted it: the temporary ids
// of the new objects give way to the real ones, and the version and the object
// limit come from the answer. Everything else is what the draft already shows.
export const buildPublishedModel = (
    draft: EditorModel,
    result: PublishResult
): EditorModel => {
    const realId = (id: string): string => result.idMap[id] ?? id;

    return {
        ...draft,
        placed: draft.placed.map((item) => ({
            ...item,
            id: realId(item.id),
            parentId: item.parentId === null ? null : realId(item.parentId),
        })),
        limits: result.limits,
        version: result.version,
    };
};
