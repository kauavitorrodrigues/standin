import type { LibraryPalette } from "../../../assets/types/library";
import type { StampToModelResult } from "../types/stamp-to-model-result";
import type { Stamp } from "../types/stamp";
import { LAYOUT_LAYER_NAMES } from "../../schemas/layout.schema";
import { buildBlankEditorModel } from "./buildBlankEditorModel";
import { buildStampOps } from "./buildStampOps";

/**
 * Opens a stamp as an editable model with the stamp laid on the origin. The
 * model has the size of `canvas` when given (the composer passes the maximum
 * size and frames the area inside it), otherwise the size of the stamp. This
 * is how the composer opens an existing area. The
 * zone is not placed in the model, its name comes back as `zoneLabel`. The
 * stamp must have passed StampSchema, and it fails with the placement errors
 * when the library no longer allows it.
 */
export const stampToModel = (
    stamp: Stamp,
    library: LibraryPalette,
    canvas?: { width: number; height: number }
): StampToModelResult => {
    const blank = buildBlankEditorModel({
        width: canvas?.width ?? stamp.width,
        height: canvas?.height ?? stamp.height,
        library,
    });

    let count = 0;
    const result = buildStampOps(
        blank,
        { ...stamp, zone: null },
        0,
        0,
        () => `object-${++count}`,
        LAYOUT_LAYER_NAMES.GROUND
    );
    if (!result.ok) return result;

    return {
        ok: true,
        model: result.model,
        zoneLabel: stamp.zone?.label ?? null,
    };
};
