import { compileSpec } from "@standin/authoring";
import type { CompileSpecResult, Spec } from "@standin/authoring";
import { buildEditorModel } from "@standin/contracts";
import type { EditorModel } from "@standin/contracts";
import { SpecInvalidError } from "../../../errors/SpecInvalidError";
import type { MapContext, MapPlan } from "../../../types";

// Builds the spec on the map the server sent. The ops are the same ones the
// editor would send, so the server applies them like a publish.
export const compileMapPlan = (
    spec: Spec,
    context: MapContext,
    mapId: string
): MapPlan => {
    const base: EditorModel = buildEditorModel(context.render, context.library);
    const compiled: CompileSpecResult = compileSpec(spec, { base });
    if (!compiled.ok) throw new SpecInvalidError(compiled.issues);

    return {
        mapId,
        kind: spec.kind,
        layoutVersion: context.render.map.layoutVersion,
        ops: compiled.ops,
    };
};
