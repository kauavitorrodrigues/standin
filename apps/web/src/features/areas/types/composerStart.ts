import type { EditorModel } from "@standin/contracts";
import type { TileRect } from "@/features/editor/types/tile-rect";
import type { AreaComposerFormValues } from "./areaComposerForm";

// What the composer opens with: the model on the canvas, the frame on it and
// the first values of the fields.
export type ComposerStart = {
    model: EditorModel;
    frame: TileRect;
    values: AreaComposerFormValues;
};

export type ComposerStartResult =
    { ok: true; start: ComposerStart } | { ok: false };
