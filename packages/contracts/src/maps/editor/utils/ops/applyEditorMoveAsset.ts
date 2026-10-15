import { ASSET_PLACEMENTS } from "../../../../assets/enums/asset-placement";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
} from "../../../layout/issues";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorModel } from "../../types/editor-model";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { canPlaceAsset } from "../canPlaceAsset";
import { pixelDistance, shiftPixelAnchor } from "../pixelAnchor";
import { placementIssue } from "./placementIssue";

const path = "op.move_asset";

const fail = (code: Parameters<typeof createIssue>[0], message: string) => ({
    ok: false as const,
    errors: [createIssue(code, path, message)],
});

/**
 * Moves an object. A parent carries its children by the same delta, a child
 * moved on its own is released (parentId null) unless the op names a parent.
 * A SURFACE item keeps its parent when the op does not name one. The group is
 * validated one object at a time against a model without the group, parent
 * first, so children see the parent at its new position. The inverse is a
 * move_asset of the object back to its previous position and parentId, which
 * brings the children back by the opposite distance. The pixel offset is kept
 * when the op does not carry one, and the inverse restores it.
 */
export const applyEditorMoveAsset: EditorOpHandler<
    Extract<EditorOp, { type: "move_asset" }>
> = (model, op) => {
    const target = model.placed.find(({ id }) => id === op.id);
    if (!target) return fail(Code.OBJECT_NOT_FOUND, Messages.objectNotFound);

    const assets = new Map(model.library.assets.map((a) => [a.id, a]));
    const targetAsset = assets.get(target.assetId);
    if (!targetAsset) {
        return fail(Code.ASSET_NOT_IN_LIBRARY, Messages.assetNotInLibrary);
    }

    const moved = op.tileX !== target.tileX || op.tileY !== target.tileY;
    const isSurface = targetAsset.placement === ASSET_PLACEMENTS.SURFACE;
    const parentId = resolveParentId(op.parentId, target, moved, isSurface);

    if (
        parentId !== null &&
        (parentId === target.id ||
            !model.placed.some(({ id }) => id === parentId))
    ) {
        return isSurface
            ? { ok: false, errors: [placementIssue(Code.NOT_ON_SURFACE, path)] }
            : fail(Code.OBJECT_NOT_FOUND, Messages.objectNotFound);
    }

    const children = model.placed.filter(({ parentId: p }) => p === target.id);
    const group = new Set([target.id, ...children.map(({ id }) => id)]);

    // Working model: the group is out, and re-enters as each member is accepted.
    let working: EditorModel = {
        ...model,
        placed: model.placed.filter(({ id }) => !group.has(id)),
        limits: {
            ...model.limits,
            objectsUsed: model.limits.objectsUsed - group.size,
        },
    };
    const accept = (object: PlacedAsset) => {
        working = {
            ...working,
            placed: [...working.placed, object],
            limits: {
                ...working.limits,
                objectsUsed: working.limits.objectsUsed + 1,
            },
        };
    };

    const movedTarget: PlacedAsset = {
        ...target,
        tileX: op.tileX,
        tileY: op.tileY,
        offsetX: op.offsetX ?? target.offsetX,
        offsetY: op.offsetY ?? target.offsetY,
        parentId,
    };
    // The children go by the same distance in px, offset included.
    const delta = pixelDistance(target, movedTarget);
    const rootCheck = canPlaceAsset(working, targetAsset, op.tileX, op.tileY, {
        parentId,
        offsetX: movedTarget.offsetX,
        offsetY: movedTarget.offsetY,
    });
    if (!rootCheck.ok) {
        return {
            ok: false,
            errors: [placementIssue(rootCheck.reason, path)],
        };
    }
    accept(movedTarget);

    const movedChildren = new Map<string, PlacedAsset>();
    for (const child of children) {
        const next: PlacedAsset = {
            ...child,
            ...shiftPixelAnchor(child, delta.x, delta.y),
        };
        const childAsset = assets.get(child.assetId);
        if (childAsset) {
            const check = canPlaceAsset(
                working,
                childAsset,
                next.tileX,
                next.tileY,
                {
                    parentId: child.parentId,
                    offsetX: next.offsetX,
                    offsetY: next.offsetY,
                }
            );
            if (!check.ok) {
                return {
                    ok: false,
                    errors: [placementIssue(check.reason, path)],
                };
            }
        }
        accept(next);
        movedChildren.set(child.id, next);
    }

    return {
        ok: true,
        model: {
            ...model,
            placed: model.placed.map((object) =>
                object.id === target.id
                    ? movedTarget
                    : (movedChildren.get(object.id) ?? object)
            ),
        },
        inverse: [
            {
                type: "move_asset",
                id: target.id,
                tileX: target.tileX,
                tileY: target.tileY,
                offsetX: target.offsetX,
                offsetY: target.offsetY,
                parentId: target.parentId,
            },
        ],
        diff: [],
    };
};

const resolveParentId = (
    requested: string | null | undefined,
    target: PlacedAsset,
    moved: boolean,
    isSurface: boolean
): string | null => {
    if (requested !== undefined) return requested;
    if (isSurface || !moved) return target.parentId;
    return null;
};
