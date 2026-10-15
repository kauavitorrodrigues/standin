import type { LayoutIssue } from "../../layout/issues";
import type { StampZoneKind } from "../consts/stamp-zone-kinds";
import type { EditorModel } from "./editor-model";

// `zoneLabel` is the name of the area zone, kept out of the model because the
// composer has no zone tool, and `zoneKind` is its kind. Null label when the
// stamp has no zone.
export type StampToModelResult =
    | {
          ok: true;
          model: EditorModel;
          zoneLabel: string | null;
          zoneKind: StampZoneKind;
      }
    | { ok: false; errors: LayoutIssue[] };
