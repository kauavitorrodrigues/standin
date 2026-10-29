import {
    findDoorSlots,
    getDoorFamily,
    getDoorSizeBySide,
    getOccupiedKeys,
    pickDoorVariantForSide,
    readWallCells,
    type DoorSlot,
    type EditorModel,
    type LooseLayout,
} from "@standin/contracts";
import type { PlacementPlan } from "@/features/editor/types/PlacementPlan";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { planPlacement } from "@/features/editor/utils/planPlacement";

// The spots where the door asset can go on the rooms of the map, one per gap
// in a wall. The size of each spot is the footprint of the variant that fits
// its side, and the cells under other objects are left out.
export const getDoorSlots = (
    model: EditorModel,
    doorAssetId: string
): DoorSlot[] => {
    const family = getDoorFamily(model.library.assets, doorAssetId);
    const sizeBySide = getDoorSizeBySide(family);
    if (!sizeBySide) return [];

    return findDoorSlots({
        zones: getLayoutZones(model.layout),
        wallCells: readWallCells(model.layout as unknown as LooseLayout),
        sizeBySide,
        occupiedCells: getOccupiedKeys(model),
        mapColumns: model.width,
        mapRows: model.height,
    });
};

// What placing the door of a family at a slot means: the plan for the rotation
// that fits the side of the wall (`exact` false when the family has no such
// rotation and the base sprite is used), or null when nothing fits.
export type DoorSlotPlan = { plan: PlacementPlan; exact: boolean };

export const planDoorAtSlot = (
    model: EditorModel,
    slot: DoorSlot,
    doorAssetId: string
): DoorSlotPlan | null => {
    const pick = pickDoorVariantForSide(
        getDoorFamily(model.library.assets, doorAssetId),
        slot.side
    );
    if (!pick) return null;

    const plan = planPlacement(model, pick.variant.id, [
        slot.tileX,
        slot.tileY,
    ]);
    return { plan, exact: pick.exact };
};
