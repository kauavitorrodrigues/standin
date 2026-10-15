import { findZonesGroup } from "../../../layout/ops/findZonesGroup";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { layoutObjectToZoneInput } from "./layoutObjectToZoneInput";
import { runLayoutOp } from "./runLayoutOp";
import { zoneInputToZone } from "./zoneInputToZone";
import { zoneNotWritableIssue } from "./zoneNotWritableIssue";

export const applyEditorSetZone: EditorOpHandler<
    Extract<EditorOp, { type: "set_zone" }>
> = (model, op) => {
    const zoneId = op.zone.id ?? model.layout.nextobjectid ?? 1;
    const existing =
        op.zone.id === undefined
            ? undefined
            : findZonesGroup(model.layout)?.objects.find(
                  ({ id }) => id === zoneId
              );
    const previous = existing ? layoutObjectToZoneInput(existing) : null;
    if (existing && !previous) {
        return { ok: false, errors: [zoneNotWritableIssue(zoneId)] };
    }

    const run = runLayoutOp(model, {
        type: "set_zone",
        zone: zoneInputToZone(op.zone),
    });
    if (!run.ok) return run;

    // Restoring a zone with its own id (undo of a removal) moves the counter
    // past that id, as the removal moved it back.
    const next = run.layout.nextobjectid ?? 1;
    const layout =
        zoneId >= next
            ? { ...run.layout, nextobjectid: zoneId + 1 }
            : run.layout;

    const inverse: EditorOp[] = previous
        ? [{ type: "set_zone", zone: previous }]
        : [{ type: "remove_zone", zoneId }];

    return { ok: true, model: { ...model, layout }, inverse, diff: [] };
};
