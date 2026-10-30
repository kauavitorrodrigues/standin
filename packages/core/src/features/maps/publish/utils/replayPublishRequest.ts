import {
    OutOfScopeError,
    PublishValidationError,
    assertDiffInScope,
    validateEditorOps,
} from "@standin/contracts";
import type { EditScope, PublishRequest, User } from "@standin/contracts";
import type { RowLockMode } from "../../../../lib/types";
import type { Transaction } from "@standin/database";
import type { MapAccess } from "../../types/map-access";
import { loadEditorModel } from "../loadEditorModel";
import type { ReplayedRequest } from "../types/replayed-request";
import { assertBaseIsCurrent } from "./assertBaseIsCurrent";
import { assertRequestInScope } from "./assertRequestInScope";
import { lockMapForPublish } from "./lockMapForPublish";

// The checks every write of a draft goes through, on an open transaction:
// the map row is locked (shared for a dry run), the base must be current, and the operations must
// replay on the model read from the database and stay in scope. Nothing is
// written here.
export const replayPublishRequest = async (
    tx: Transaction,
    user: Pick<User, "id">,
    access: MapAccess,
    scope: EditScope,
    request: PublishRequest,
    rowLock?: RowLockMode
): Promise<ReplayedRequest> => {
    const currentVersion = await lockMapForPublish(tx, access.mapId, rowLock);
    await assertBaseIsCurrent(tx, access.mapId, request, currentVersion);

    const base = await loadEditorModel(tx, access);
    assertRequestInScope(request.ops, scope, { userId: user.id }, base);

    const replayed = validateEditorOps(base, request.ops);
    if (!replayed.ok) throw new PublishValidationError(replayed.issues);
    if (assertDiffInScope(base, replayed.model, scope).length > 0) {
        throw new OutOfScopeError();
    }

    return { base, model: replayed.model };
};
