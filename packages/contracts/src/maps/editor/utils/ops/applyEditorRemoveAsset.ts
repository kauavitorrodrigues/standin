import { ASSET_PLACEMENTS } from "../../../../assets/enums/asset-placement";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
} from "../../../layout/issues";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { getClaimedDesk } from "../getClaimedDesk";

/**
 * Removing a parent removes its SURFACE children and releases its GROUND
 * children (parentId back to null). The inverse places the parent, then the
 * removed children, then moves each released child back under the parent.
 * A claimed desk is refused with DESK_CLAIMED unless the op carries
 * releaseDesk, which also drops the claim from model.desks. The inverse brings
 * the object back but NOT its owner: the claim belongs to the server, so
 * undoing the removal of a claimed desk leaves it without an owner.
 */
export const applyEditorRemoveAsset: EditorOpHandler<
    Extract<EditorOp, { type: "remove_asset" }>
> = (model, op) => {
    const target = model.placed.find(({ id }) => id === op.id);
    if (!target) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.OBJECT_NOT_FOUND,
                    "op.remove_asset",
                    Messages.objectNotFound
                ),
            ],
        };
    }

    const placementOf = new Map(
        model.library.assets.map(({ id, placement }) => [id, placement])
    );
    const children = model.placed.filter(({ parentId }) => parentId === op.id);
    const removedChildren = children.filter(
        ({ assetId }) => placementOf.get(assetId) === ASSET_PLACEMENTS.SURFACE
    );
    const releasedChildren = children.filter(
        (child) => !removedChildren.includes(child)
    );

    const removedIds = new Set([
        target.id,
        ...removedChildren.map(({ id }) => id),
    ]);
    const claimed = [...removedIds].filter((id) => getClaimedDesk(model, id));
    if (claimed.length > 0 && !op.releaseDesk) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.DESK_CLAIMED,
                    "op.remove_asset",
                    Messages.deskClaimed
                ),
            ],
        };
    }

    const releasedIds = new Set(releasedChildren.map(({ id }) => id));

    const placed = model.placed
        .filter(({ id }) => !removedIds.has(id))
        .map((object) =>
            releasedIds.has(object.id) ? { ...object, parentId: null } : object
        );

    const inverse: EditorOp[] = [
        {
            type: "place_asset",
            tempId: target.id,
            assetId: target.assetId,
            tileX: target.tileX,
            tileY: target.tileY,
            parentId: target.parentId,
        },
        ...removedChildren.map((child): EditorOp => ({
            type: "place_asset",
            tempId: child.id,
            assetId: child.assetId,
            tileX: child.tileX,
            tileY: child.tileY,
            parentId: child.parentId,
        })),
        ...releasedChildren.map((child): EditorOp => ({
            type: "move_asset",
            id: child.id,
            tileX: child.tileX,
            tileY: child.tileY,
            parentId: child.parentId,
        })),
    ];

    return {
        ok: true,
        model: {
            ...model,
            placed,
            desks: model.desks.filter(
                ({ mapAssetId }) => !removedIds.has(mapAssetId)
            ),
            limits: {
                ...model.limits,
                objectsUsed: model.limits.objectsUsed - removedIds.size,
            },
        },
        inverse,
        diff: [],
    };
};
