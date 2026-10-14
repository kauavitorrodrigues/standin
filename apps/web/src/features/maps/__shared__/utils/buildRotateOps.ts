import type { EditorModel, EditorOp } from "@standin/contracts";
import { buildReplaceOps } from "@/features/maps/__shared__/utils/buildReplaceOps";
import { getObjectToolbarControls } from "@/features/maps/__shared__/utils/getObjectToolbarControls";

// The replace_asset that turns an object to the next rotation of its family,
// keeping the color when the target has it. Empty when there is no other
// rotation, or the new one does not fit.
export const buildRotateOps = (
    model: Readonly<EditorModel>,
    id: string
): EditorOp[] => {
    const controls = getObjectToolbarControls(model, id);
    const next = controls?.alternatives.rotations[0];
    if (!next) return [];

    return buildReplaceOps(id, next.id);
};
