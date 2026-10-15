import { EDIT_SCOPES } from "@standin/contracts";
import type { EditorModel, EditorOp, EditScopeKind } from "@standin/contracts";
import type { StoredDraft } from "@/features/maps/__shared__/types/StoredDraft";

// What goes to IndexedDB for a draft. The decorator also keeps the objects
// revision it started from, since that is what its publish is checked against.
export const buildStoredDraft = (
    mode: EditScopeKind,
    base: EditorModel,
    ops: EditorOp[]
): StoredDraft => {
    switch (mode) {
        case EDIT_SCOPES.OBJECTS:
            return {
                baseVersion: base.version,
                baseObjectsRevision: base.objectsRevision ?? null,
                ops,
            };
        case EDIT_SCOPES.MAP:
            return { baseVersion: base.version, ops };
    }
};
