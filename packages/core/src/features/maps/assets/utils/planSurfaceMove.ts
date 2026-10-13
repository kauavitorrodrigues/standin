import {
    MapAssetFloorNotAllowedError,
    MapAssetTargetDeskNotFoundError,
} from "@standin/contracts";
import type { Footprint } from "../types/footprint";
import type { Item } from "../types/item";
import { assertSurfacePosition } from "./assertSurfacePosition";

/** A SURFACE item stays on a desk: the destination must exist and fit it. */
export const planSurfaceMove = (
    current: Item,
    footprint: Footprint,
    targetParentId: string | null,
    items: Item[]
) => {
    if (!targetParentId) throw new MapAssetFloorNotAllowedError();

    const parent = items.find((item) => item.rowId === targetParentId);
    if (!parent) throw new MapAssetTargetDeskNotFoundError();

    assertSurfacePosition(
        footprint,
        parent,
        items.filter(
            (item) =>
                item.parentId === targetParentId && item.rowId !== current.rowId
        )
    );
};
