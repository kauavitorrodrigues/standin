import type { ApplyEditorOpResult } from "../../types/apply-editor-op-result";
import type { EditorModel } from "../../types/editor-model";
import type { EditorOp } from "../../schemas/editorOp.schema";
import { toLayoutLibrary } from "../toLayoutLibrary";
import { buildTileInverse } from "./buildTileInverse";
import { diffTileLayers } from "./diffTileLayers";
import { pruneUnusedTilesets } from "./pruneUnusedTilesets";
import { runLayoutOp } from "./runLayoutOp";

type TileOp = Extract<EditorOp, { type: "paint" | "erase" }>;

/**
 * Shared by paint and erase: runs the layout engine, takes out the tilesets the
 * change left unused, diffs the tile layers
 * (which also catches the derived wall top) and builds the inverse from it.
 */
export const applyTileOp = (
    model: EditorModel,
    op: TileOp
): ApplyEditorOpResult => {
    const run = runLayoutOp(model, op);
    if (!run.ok) return run;

    const library = toLayoutLibrary(model.library, model.usedTilesets);
    const layout = pruneUnusedTilesets(model.layout, run.layout, library);

    const diff = diffTileLayers(model.layout, layout);
    const inverse = buildTileInverse(model.layout, library, diff);
    if (!inverse.ok) return inverse;

    return {
        ok: true,
        model: { ...model, layout },
        inverse: inverse.inverse,
        diff,
    };
};
