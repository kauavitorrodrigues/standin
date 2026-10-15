import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
} from "../../../layout/issues";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { canReplaceAsset } from "../canReplaceAsset";

/**
 * Swaps the asset of an object, keeping its position, parentId, children and
 * propertyOverrides. The inverse swaps the previous asset back. The desk link
 * is kept by the server, the model does not know claimed desks.
 */
export const applyEditorReplaceAsset: EditorOpHandler<
    Extract<EditorOp, { type: "replace_asset" }>
> = (model, op) => {
    const path = "op.replace_asset";
    const target = model.placed.find(({ id }) => id === op.id);
    if (!target) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.OBJECT_NOT_FOUND,
                    path,
                    Messages.objectNotFound
                ),
            ],
        };
    }

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

    const check = canReplaceAsset(model, target, asset);
    if (!check.ok) {
        return {
            ok: false,
            errors: [
                createIssue(
                    Code.REPLACE_INCOMPATIBLE,
                    path,
                    Messages.replaceIncompatible
                ),
            ],
        };
    }

    return {
        ok: true,
        model: {
            ...model,
            placed: model.placed.map((object) =>
                object.id === op.id
                    ? { ...object, assetId: op.assetId }
                    : object
            ),
        },
        inverse: [
            { type: "replace_asset", id: op.id, assetId: target.assetId },
        ],
        diff: [],
    };
};
