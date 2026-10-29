import {
    LAYOUT_ISSUE_CODES,
    LAYOUT_ISSUE_MESSAGES,
    LAYOUT_ZONES_LAYER_NAME,
    LAYOUT_ZONE_KINDS,
    buildEditorModel,
    getLayoutZones,
    validateEditorOps,
} from "@standin/contracts";
import type {
    EditorModel,
    EditorOp,
    LibraryPalette,
    MapRenderPayload,
} from "@standin/contracts";
import type { ValidateOpsOptions, ValidateOpsResult } from "../types";

/** The model to start from: the render of a map and the palette to author with. */
export const buildBaseModel = (
    render: MapRenderPayload,
    library: LibraryPalette
): EditorModel => buildEditorModel(render, library);

/**
 * The dry run of a draft: the same function the server runs on publish
 * (`validateEditorOps`), so the issues are the same for the same input. Nothing
 * is written.
 */
export const validateOps = (
    base: EditorModel,
    ops: EditorOp[],
    { requireSpawn = false }: ValidateOpsOptions = {}
): ValidateOpsResult => {
    const result = validateEditorOps(base, ops);
    if (!result.ok || !requireSpawn) return result;

    const hasSpawn = getLayoutZones(result.model.layout).some(
        ({ kind }) => kind === LAYOUT_ZONE_KINDS.SPAWN
    );
    if (hasSpawn) return result;

    return {
        ok: false,
        issues: [
            {
                opIndex: Math.max(ops.length - 1, 0),
                code: LAYOUT_ISSUE_CODES.SPAWN_MISSING,
                path: LAYOUT_ZONES_LAYER_NAME,
                message: LAYOUT_ISSUE_MESSAGES.spawnMissing,
            },
        ],
    };
};
