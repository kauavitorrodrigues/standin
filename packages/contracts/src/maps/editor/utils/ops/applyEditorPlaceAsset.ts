import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
} from "../../../layout/issues";
import type { PlacedAsset } from "../../../render/render-payload.schema";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { canPlaceAsset } from "../canPlaceAsset";
import { placementIssue } from "./placementIssue";

export const applyEditorPlaceAsset: EditorOpHandler<
    Extract<EditorOp, { type: "place_asset" }>
> = (model, op) => {
    const path = "op.place_asset";
    const asset = model.library.assets.find(({ id }) => id === op.assetId);
    if (!asset) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.ASSET_NOT_IN_LIBRARY,
                    path,
                    Messages.assetNotInLibrary
                ),
            ],
        };
    }

    if (model.placed.some(({ id }) => id === op.tempId)) {
        return {
            ok: false,
            errors: [
                createIssue(Code.OBJECT_ID_TAKEN, path, Messages.objectIdTaken),
            ],
        };
    }

    const parentId = op.parentId ?? null;
    const check = canPlaceAsset(model, asset, op.tileX, op.tileY, {
        parentId,
    });
    if (!check.ok) {
        return { ok: false, errors: [placementIssue(check.reason, path)] };
    }

    const placed: PlacedAsset = {
        id: op.tempId,
        assetId: op.assetId,
        tileX: op.tileX,
        tileY: op.tileY,
        offsetX: op.offsetX ?? 0,
        offsetY: op.offsetY ?? 0,
        parentId,
        propertyOverrides: null,
    };

    return {
        ok: true,
        model: {
            ...model,
            placed: [...model.placed, placed],
            limits: {
                ...model.limits,
                objectsUsed: model.limits.objectsUsed + 1,
            },
        },
        inverse: [{ type: "remove_asset", id: op.tempId }],
        diff: [],
    };
};
