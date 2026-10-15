import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScopeKind } from "@standin/contracts";
import type { DraftState } from "@/features/editor/types/DraftState";
import type { PublishAttempt } from "@/features/maps/__shared__/types/publish-attempt";
import { isSameOps } from "@/features/maps/__shared__/utils/isSameOps";

const getObjectsRevision = (state: DraftState): string | null =>
    state.base.objectsRevision ?? null;

// The request to send. A repeat of the last attempt over the same base and the
// same operations keeps its publishId. Any change to the draft is a new
// request, so a stored answer never stands in for different operations. The
// decorator (`objects`) is based on the objects revision, not on the layout
// version.
export const getPublishAttempt = (
    previous: PublishAttempt | null,
    state: DraftState,
    createId: () => string,
    scope: EditScopeKind = EDIT_SCOPES.MAP
): PublishAttempt => {
    const baseVersion = state.base.version;

    switch (scope) {
        case EDIT_SCOPES.OBJECTS: {
            const baseObjectsRevision = getObjectsRevision(state);
            if (
                previous?.scope === EDIT_SCOPES.OBJECTS &&
                previous.baseObjectsRevision === baseObjectsRevision &&
                isSameOps(previous.ops, state.ops)
            ) {
                return previous;
            }
            return {
                publishId: createId(),
                baseVersion,
                scope,
                baseObjectsRevision,
                ops: [...state.ops],
            };
        }
        case EDIT_SCOPES.MAP:
            if (
                previous &&
                previous.baseVersion === baseVersion &&
                isSameOps(previous.ops, state.ops)
            ) {
                return previous;
            }
            return { publishId: createId(), baseVersion, ops: [...state.ops] };
    }
};
