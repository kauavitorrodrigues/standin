import {
    ASSET_PLACEMENTS,
    pixelDistance,
    shiftPixelAnchor,
    MapAssetParentNotAllowedError,
} from "@standin/contracts";
import type { GroundMoveInput } from "../types/ground-move-input";
import type { GroundMovePlan } from "../types/ground-move-plan";
import type { Item } from "../types/item";
import type { RowChange } from "../types/row-change";
import { assertGroundPosition } from "./assertGroundPosition";
import { assertWallPosition } from "./assertWallPosition";
import { toFootprint } from "./toFootprint";

/**
 * Moving a GROUND or WALL object. Moving a bundle root moves its children by
 * the same delta; moving a bundle part on its own detaches it from the root.
 * Returns the parent the object ends up with and the rows that change besides
 * the object itself.
 */
export const planGroundMove = ({
    current,
    def,
    next,
    nextOffset,
    requestedParentId,
    items,
    children,
    map,
}: GroundMoveInput): GroundMovePlan => {
    if (requestedParentId) throw new MapAssetParentNotAllowedError();

    const moved = next.tileX !== current.tileX || next.tileY !== current.tileY;
    const parentId =
        requestedParentId === undefined
            ? moved
                ? null
                : current.parentId
            : requestedParentId;

    const target = {
        ...next,
        offsetX: nextOffset?.offsetX ?? current.offsetX,
        offsetY: nextOffset?.offsetY ?? current.offsetY,
    };
    const delta = pixelDistance(current, target);
    const shifted = delta.x !== 0 || delta.y !== 0;

    const movingRoot = shifted && children.length > 0;
    const group: Item[] = movingRoot ? [current, ...children] : [current];
    const groupIds = new Set(group.map((item) => item.rowId));
    const others = items.filter((item) => !groupIds.has(item.rowId));
    const childChanges: RowChange[] = [];

    for (const member of group) {
        const isSelf = member.rowId === current.rowId;
        const anchor = shiftPixelAnchor(member, delta.x, delta.y);
        const position = isSelf ? next : anchor;
        const footprint = toFootprint(position, isSelf ? def : member);

        if (member.placement === ASSET_PLACEMENTS.WALL) {
            assertWallPosition(footprint, map);
        } else if (member.placement === ASSET_PLACEMENTS.GROUND) {
            assertGroundPosition(footprint, map, others);
        }

        if (!isSelf) {
            childChanges.push({
                id: member.rowId,
                ...anchor,
                parentId: member.parentId,
            });
        }
    }

    return { parentId, childChanges };
};
