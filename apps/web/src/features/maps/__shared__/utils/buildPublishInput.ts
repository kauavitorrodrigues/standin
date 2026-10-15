import { EDIT_SCOPES } from "@standin/contracts";
import type { PublishAttempt } from "@/features/maps/__shared__/types/publish-attempt";
import type { PublishInput } from "@/features/maps/__shared__/types/publish-input";

// The request of an attempt. The Studio one has no scope (the server reads it
// as the whole map), the decorator one says `objects` and carries the objects
// revision instead of the layout version.
export const buildPublishInput = (
    attempt: PublishAttempt,
    mapId: string,
    sessionId: string
): PublishInput => {
    switch (attempt.scope) {
        case EDIT_SCOPES.OBJECTS:
            return {
                mapId,
                sessionId,
                scope: EDIT_SCOPES.OBJECTS,
                publishId: attempt.publishId,
                baseObjectsRevision: attempt.baseObjectsRevision ?? null,
                ops: attempt.ops,
            };
        default:
            return {
                mapId,
                sessionId,
                publishId: attempt.publishId,
                baseVersion: attempt.baseVersion,
                ops: attempt.ops,
            };
    }
};
