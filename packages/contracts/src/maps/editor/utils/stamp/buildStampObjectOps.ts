import type { EditorOp } from "../../schemas/editorOp.schema";
import type { Stamp } from "../../types/stamp";

/**
 * One place_asset for each object, in the order of the stamp, so a parent is
 * always placed before its children. `newTempId` gives every object its id.
 */
export const buildStampObjectOps = (
    stamp: Stamp,
    tileX: number,
    tileY: number,
    newTempId: () => string
): EditorOp[] => {
    const tempIds = stamp.objects.map(() => newTempId());

    return stamp.objects.map((object, index) => ({
        type: "place_asset",
        tempId: tempIds[index],
        assetId: object.assetId,
        tileX: tileX + object.dx,
        tileY: tileY + object.dy,
        offsetX: object.offsetX,
        offsetY: object.offsetY,
        parentId:
            object.parentIndex === null ? null : tempIds[object.parentIndex],
    }));
};
