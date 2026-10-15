import {
    ASSET_PLACEMENTS,
    shiftPixelAnchor,
    TILE_SIZE,
    splitPixelAnchor,
    type Cell,
    type EditorModel,
    type PlacedAsset,
} from "@standin/contracts";
import { clampToSurface } from "@/features/editor/utils/planFreePosition";
import { findSurfaceParent } from "@/features/editor/utils/findSurfaceParent";
import { snapToSurface } from "@/features/editor/utils/snapToSurface";

// Where the pointer was when the press started, and where it is now, in world
// px. Giving it drags free, with no snapping.
type FreeDrag = { startX: number; startY: number; x: number; y: number };

type Params = {
    model: Readonly<EditorModel>;
    placed: PlacedAsset;
    // The cell the press started on, and the one the pointer is on now.
    from: Cell;
    to: Cell;
    free?: FreeDrag;
};

export type DragTarget = {
    tileX: number;
    tileY: number;
    offsetX: number;
    offsetY: number;
    parentId: string | null | undefined;
};

// Where a drag puts the object. On the grid it follows the pointer by the same
// number of cells and drops the pixel offset. Free, it follows the pointer by
// the same distance in px, keeping the point that was grabbed under it. A
// SURFACE item goes instead to the top under the pointer, kept inside it (so
// it can hop between desks); with no top there it keeps the pointer distance
// and the move is refused with no parent.
export const getDragTarget = ({
    model,
    placed,
    from,
    to,
    free,
}: Params): DragTarget => {
    const byPointer: DragTarget = free
        ? {
            ...shiftPixelAnchor(
                placed,
                Math.round(free.x - free.startX),
                Math.round(free.y - free.startY)
            ),
            parentId: undefined,
        }
        : {
            tileX: placed.tileX + (to[0] - from[0]),
            tileY: placed.tileY + (to[1] - from[1]),
            offsetX: 0,
            offsetY: 0,
            parentId: undefined,
        };

    const asset = model.library.assets.find(({ id }) => id === placed.assetId);
    if (!asset || asset.placement !== ASSET_PLACEMENTS.SURFACE) {
        return byPointer;
    }

    const parent = findSurfaceParent(model, to);
    const parentAsset = model.library.assets.find(
        ({ id }) => id === parent?.assetId
    );
    if (!parent || !parentAsset) return { ...byPointer, parentId: null };

    if (!free) {
        const [tileX, tileY] = snapToSurface(to, asset, parent, parentAsset);
        return { tileX, tileY, offsetX: 0, offsetY: 0, parentId: parent.id };
    }

    const inside = clampToSurface(
        byPointer.tileX * TILE_SIZE + byPointer.offsetX,
        (byPointer.tileY + 1) * TILE_SIZE + byPointer.offsetY,
        asset,
        { placed: parent, asset: parentAsset }
    );
    return {
        ...splitPixelAnchor(inside.left, inside.bottom),
        parentId: parent.id,
    };
};
