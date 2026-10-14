import {
    applyEditorOp,
    LAYOUT_ISSUE_CODES,
    type EditorModel,
} from "@standin/contracts";
import type { MovePlan } from "@/features/maps/__shared__/types/MovePlan";

type Params = {
    model: Readonly<EditorModel>;
    id: string;
    tileX: number;
    tileY: number;
    // Undefined keeps the offset the object has.
    offsetX?: number;
    offsetY?: number;
    // Undefined keeps the rule of the operation: a SURFACE item stays on its
    // parent and any other object that moves is released from it.
    parentId?: string | null;
};

// The move_asset for a target and whether the model accepts it. The check is
// the operation itself: it runs canPlaceAsset for the object and for its
// children against a model without the group, so the object never collides
// with itself or with what it carries.
export const planMove = ({
    model,
    id,
    tileX,
    tileY,
    offsetX,
    offsetY,
    parentId,
}: Params): MovePlan => {
    const op: MovePlan["op"] = {
        type: "move_asset",
        id,
        tileX,
        tileY,
        ...(offsetX === undefined ? {} : { offsetX }),
        ...(offsetY === undefined ? {} : { offsetY }),
        ...(parentId === undefined ? {} : { parentId }),
    };

    const result = applyEditorOp(model, op);
    const reason = result.ok
        ? null
        : (result.errors[0]?.code ?? LAYOUT_ISSUE_CODES.OBJECT_NOT_FOUND);

    const current = model.placed.find((placed) => placed.id === id);
    return {
        op,
        tileX,
        tileY,
        offsetX: offsetX ?? current?.offsetX ?? 0,
        offsetY: offsetY ?? current?.offsetY ?? 0,
        parentId: parentId ?? null,
        reason,
    };
};
