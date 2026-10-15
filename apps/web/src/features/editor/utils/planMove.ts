import {
    applyEditorOp,
    LAYOUT_ISSUE_CODES,
    type EditorModel,
    type PlacedAsset,
} from "@standin/contracts";
import type { PlacementReason } from "@/features/editor/types/PlacementReason";
import {
    getDoorRefusal,
    type DoorRooms,
} from "@/features/editor/utils/getDoorRefusal";
import type { MovePlan } from "@/features/editor/types/MovePlan";

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
    // The rooms the door rule reads instead of the zones of the model.
    rooms?: DoorRooms;
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
    rooms,
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
    const current = model.placed.find((placed) => placed.id === id);
    const reason: PlacementReason | null = result.ok
        ? getMoveDoorRefusal(
            model,
            current,
            {
                tileX,
                tileY,
                offsetX: offsetX ?? current?.offsetX ?? 0,
                offsetY: offsetY ?? current?.offsetY ?? 0,
            },
            rooms
        )
        : (result.errors[0]?.code ?? LAYOUT_ISSUE_CODES.OBJECT_NOT_FOUND);

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

// A door that moves must land on the border of a room too.
const getMoveDoorRefusal = (
    model: Readonly<EditorModel>,
    current: PlacedAsset | undefined,
    spot: Parameters<typeof getDoorRefusal>[2],
    rooms?: DoorRooms
): PlacementReason | null => {
    const asset = model.library.assets.find(
        ({ id }) => id === current?.assetId
    );
    if (!asset) return null;

    return getDoorRefusal(model, asset, spot, rooms);
};
