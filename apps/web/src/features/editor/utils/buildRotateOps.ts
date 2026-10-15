import {
    findReplaceAnchor,
    type EditorModel,
    type EditorOp,
} from "@standin/contracts";
import { buildReplaceOps } from "@/features/editor/utils/buildReplaceOps";
import { getObjectToolbarControls } from "@/features/editor/utils/getObjectToolbarControls";

// The replace_asset that turns an object to the next rotation of its family,
// keeping the color when the target has it. When the new footprint does not
// fit where the object stands, the op carries the anchor it grows from
// instead. Empty when there is no other rotation, or it fits nowhere.
export const buildRotateOps = (
    model: Readonly<EditorModel>,
    id: string
): EditorOp[] => {
    const controls = getObjectToolbarControls(model, id);
    const next = controls?.alternatives.rotations[0];
    const placed = model.placed.find((item) => item.id === id);
    if (!controls || !next || !placed) return [];

    const anchor = findReplaceAnchor(
        model as EditorModel,
        placed,
        controls.current,
        next
    );
    if (!anchor) return [];

    const stays =
        anchor.tileX === placed.tileX && anchor.tileY === placed.tileY;
    if (stays) return buildReplaceOps(id, next.id);

    return [
        {
            type: "replace_asset",
            id,
            assetId: next.id,
            tileX: anchor.tileX,
            tileY: anchor.tileY,
        },
    ];
};
