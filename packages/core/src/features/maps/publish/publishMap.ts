import { db } from "@standin/database";
import {
    LockNotHeldError,
    MAX_PUBLISH_OPS,
    PublishForbiddenError,
    PublishTooManyOpsError,
    PublishValidationError,
    StaleLayoutVersionError,
    replayOps,
} from "@standin/contracts";
import type { PublishRequest, PublishResult, User } from "@standin/contracts";
import { MapLockService } from "../lock";
import type { MapAccess } from "../types/map-access";
import { loadEditorModel } from "./loadEditorModel";
import { persistModelDiff } from "./persistModelDiff";
import type { PublishOutcome } from "./types/publish-outcome";
import { getReleaseDeskIds } from "./utils/getReleaseDeskIds";
import { lockMapForPublish } from "./utils/lockMapForPublish";
import { toPublishIssues } from "./utils/toPublishIssues";

/**
 * Publishes a draft: replays every operation on the model read from the
 * database and writes the difference, all in one transaction, so any failure
 * leaves the map as it was. The lock stays with whoever published.
 *
 * The replay stops at the first operation that fails, so a refusal carries
 * the issues of that operation only. The request body is validated by the
 * caller. Events are emitted by the caller too, after the commit.
 */
export const publishMap = async (
    user: Pick<User, "id">,
    access: MapAccess,
    sessionId: string,
    request: PublishRequest
): Promise<PublishOutcome> => {
    if (!access.canEdit) throw new PublishForbiddenError();

    const lock = MapLockService.get(access.mapId);
    if (!lock || lock.sessionId !== sessionId || lock.userId !== user.id) {
        throw new LockNotHeldError();
    }

    if (lock.lastPublish?.publishId === request.publishId) {
        return { result: lock.lastPublish.result, releasedDesks: [] };
    }

    if (request.ops.length > MAX_PUBLISH_OPS) {
        throw new PublishTooManyOpsError();
    }

    const { result, releasedDesks } = await db.transaction(async (tx) => {
        const currentVersion = await lockMapForPublish(tx, access.mapId);
        if (currentVersion !== request.baseVersion) {
            throw new StaleLayoutVersionError(currentVersion);
        }

        const base = await loadEditorModel(tx, access);
        const replayed = replayOps(base, request.ops);
        if (!replayed.ok) {
            throw new PublishValidationError(
                toPublishIssues(replayed.opIndex, replayed.errors)
            );
        }

        const persisted = await persistModelDiff(
            tx,
            access,
            base,
            replayed.model,
            { releaseDeskIds: getReleaseDeskIds(request.ops) }
        );

        const result: PublishResult = {
            version: persisted.version,
            idMap: persisted.idMap,
            limits: persisted.limits,
        };
        return { result, releasedDesks: persisted.releasedDesks };
    });

    MapLockService.recordPublish(access.mapId, sessionId, {
        publishId: request.publishId,
        result,
    });

    return { result, releasedDesks };
};
