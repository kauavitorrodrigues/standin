import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { layoutObjectToZoneInput } from "./layoutObjectToZoneInput";
import { runLayoutOp } from "./runLayoutOp";
import { zoneNotWritableIssue } from "./zoneNotWritableIssue";

export const applyEditorRemoveZone: EditorOpHandler<
    Extract<EditorOp, { type: "remove_zone" }>
> = (model, op) => {
    const existing = findZonesGroup(model.layout)?.objects.find(
        ({ id }) => id === op.zoneId
    );
    const previous = existing ? layoutObjectToZoneInput(existing) : null;
    if (existing && !previous) {
        return { ok: false, errors: [zoneNotWritableIssue(op.zoneId)] };
    }

    const run = runLayoutOp(model, op);
    if (!run.ok) return run;

    // Removing the zone that took the last id gives that id back, so undoing
    // a set_zone and redoing it yields the same id.
    const wasLastId =
        existing && op.zoneId === (run.layout.nextobjectid ?? 1) - 1;
    const layout = wasLastId
        ? { ...run.layout, nextobjectid: op.zoneId }
        : run.layout;

    const inverse: EditorOp[] = previous
        ? [{ type: "set_zone", zone: previous }]
        : [];

    return { ok: true, model: { ...model, layout }, inverse, diff: [] };
};
