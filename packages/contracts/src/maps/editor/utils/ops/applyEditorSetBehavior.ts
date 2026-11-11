import { OBJECT_BEHAVIORS } from "../../../behaviors/consts";
import { validateBehaviorParams } from "../../../behaviors/utils/validateBehaviorParams";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
} from "../../../layout/issues";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";

/**
 * Sets the params of the behavior an object has. The behavior itself is the
 * one its asset was created with, so the params are refused when the asset has
 * none that takes them. Null clears the params. An embedded website needs a
 * safe address. The inverse puts the previous params back.
 */
export const applyEditorSetBehavior: EditorOpHandler<
    Extract<EditorOp, { type: "set_behavior" }>
> = (model, op) => {
    const path = "op.set_behavior";
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

    if (op.params !== null) {
        const asset = model.library.assets.find(
            ({ id }) => id === target.assetId
        );
        if (asset?.behavior !== OBJECT_BEHAVIORS.EMBEDDED_WEBSITE) {
            return {
                ok: false,
                errors: [
                    createIssue(
                        Code.BEHAVIOR_NOT_ON_ASSET,
                        path,
                        Messages.behaviorNotOnAsset
                    ),
                ],
            };
        }

        const validation = validateBehaviorParams(op.params, {
            appOrigins: model.appOrigins,
        });
        if (!validation.ok) {
            return {
                ok: false,
                errors: [
                    createIssue(
                        Code.BEHAVIOR_URL_INVALID,
                        path,
                        validation.message
                    ),
                ],
            };
        }
    }

    return {
        ok: true,
        model: {
            ...model,
            placed: model.placed.map((object) =>
                object.id === op.id
                    ? { ...object, behaviorParams: op.params }
                    : object
            ),
        },
        inverse: [
            {
                type: "set_behavior",
                id: op.id,
                params: target.behaviorParams,
            },
        ],
        diff: [],
    };
};
