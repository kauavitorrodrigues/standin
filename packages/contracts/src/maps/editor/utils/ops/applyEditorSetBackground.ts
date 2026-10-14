import { EDITOR_DEFAULT_BACKGROUND_COLOR } from "../../consts/limits";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { runLayoutOp } from "./runLayoutOp";

export const applyEditorSetBackground: EditorOpHandler<
    Extract<EditorOp, { type: "set_background" }>
> = (model, op) => {
    const run = runLayoutOp(model, op);
    if (!run.ok) return run;

    // A layout without a background color goes back to the default one.
    const previous = model.layout.backgroundcolor;
    const inverse: EditorOp[] = [
        { type: "set_background", color: previous ?? EDITOR_DEFAULT_BACKGROUND_COLOR },
    ];

    return {
        ok: true,
        model: { ...model, layout: run.layout },
        inverse,
        diff: [],
    };
};
