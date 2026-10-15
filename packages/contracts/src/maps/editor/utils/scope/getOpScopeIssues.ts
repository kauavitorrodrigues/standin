import { ASSET_PLACEMENTS } from "../../../../assets/enums/asset-placement";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
} from "../../../layout/issues";
import type { LayoutIssue } from "../../../layout/issues";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditActor } from "../../types/edit-actor";
import type { EditorModel } from "../../types/editor-model";
import { findClaimInChain } from "./findClaimInChain";

type Parents = Map<string, string | null>;

const deskTaken = (path: string): LayoutIssue =>
    createIssue(Code.DESK_CLAIMED, path, Messages.deskClaimedByOther);

const isOther = (
    claim: { userId: string } | undefined,
    actor: EditActor
): boolean => claim !== undefined && claim.userId !== actor.userId;

const touchesOtherDesk = (
    model: EditorModel,
    parents: Parents,
    actor: EditActor,
    ...objectIds: (string | null | undefined)[]
): boolean =>
    objectIds.some((objectId) =>
        isOther(findClaimInChain(model.desks, parents, objectId), actor)
    );

// The object and the SURFACE items that go with it when it is removed.
const getRemovedIds = (
    model: EditorModel,
    placements: Map<string, string>,
    parents: Parents,
    id: string
): string[] => {
    const removed = [id];
    for (const [childId, parentId] of parents) {
        const childAsset = model.placed.find((object) => object.id === childId);
        if (parentId !== id || !childAsset) continue;
        if (placements.get(childAsset.assetId) === ASSET_PLACEMENTS.SURFACE) {
            removed.push(childId);
        }
    }
    return removed;
};

const getRemoveIssues = (
    model: EditorModel,
    placements: Map<string, string>,
    parents: Parents,
    actor: EditActor,
    op: Extract<EditorOp, { type: "remove_asset" }>,
    path: string
): LayoutIssue[] => {
    if (touchesOtherDesk(model, parents, actor, op.id)) {
        return [deskTaken(path)];
    }

    const removed = getRemovedIds(model, placements, parents, op.id);
    if (removed.some((id) => touchesOtherDesk(model, parents, actor, id))) {
        return [deskTaken(path)];
    }

    const ownClaim = removed.some((id) =>
        model.desks.some(
            ({ mapAssetId, userId }) =>
                mapAssetId === id && userId === actor.userId
        )
    );
    if (ownClaim && !op.releaseDesk) {
        return [
            createIssue(Code.DESK_CLAIMED, path, Messages.deskReleaseRequired),
        ];
    }

    return [];
};

/**
 * What one operation breaks: a desk of someone else (or an item on it), or the
 * own desk removed without `releaseDesk`. `parents` is the parent of every
 * object as the list stands before this operation, tempIds included.
 */
export const getOpScopeIssues = (
    model: EditorModel,
    parents: Parents,
    actor: EditActor,
    op: EditorOp
): LayoutIssue[] => {
    const path = `op.${op.type}`;
    const placements = new Map<string, string>(
        model.library.assets.map(({ id, placement }) => [id, placement])
    );

    switch (op.type) {
        case "place_asset":
            if (touchesOtherDesk(model, parents, actor, op.parentId))
                return [deskTaken(path)];
            return [];
        case "move_asset":
            if (touchesOtherDesk(model, parents, actor, op.id, op.parentId))
                return [deskTaken(path)];
            return [];
        case "replace_asset":
            if (touchesOtherDesk(model, parents, actor, op.id))
                return [deskTaken(path)];
            return [];
        case "remove_asset":
            return getRemoveIssues(model, placements, parents, actor, op, path);
        default:
            return [];
    }
};
