import type { LibraryPalette } from "../../../assets/types/library";
import type { StampToModelResult } from "../types/stamp-to-model-result";
import type { Stamp } from "../types/stamp";
import { buildBlankEditorModel } from "./buildBlankEditorModel";
import { buildStampOps } from "./buildStampOps";

/**
 * Opens a stamp as an editable model: a blank model of its size with the stamp
 * laid on the origin. This is how the composer opens an existing area. The
 * zone is not placed in the model, its name comes back as `zoneLabel`. The
 * stamp must have passed StampSchema, and it fails with the placement errors
 * when the library no longer allows it.
 */
export const stampToModel = (
    stamp: Stamp,
    library: LibraryPalette
): StampToModelResult => {
    const blank = buildBlankEditorModel({
        width: stamp.width,
        height: stamp.height,
        library,
    });

    let count = 0;
    const result = buildStampOps(
        blank,
        { ...stamp, zone: null },
        0,
        0,
        () => `object-${++count}`
    );
    if (!result.ok) return result;

    return {
        ok: true,
        model: result.model,
        zoneLabel: stamp.zone?.label ?? null,
    };
};
