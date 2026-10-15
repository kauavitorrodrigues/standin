import {
    ASSET_TYPES,
    DOOR_SIDES,
    findDoorSlots,
    getFamilyId,
    getOccupiedCells,
    pickDoorVariantForSide,
    readWallCells,
    type AssetDefinition,
    type DoorSide,
    type DoorSlot,
    type EditorModel,
    type LooseLayout,
} from "@standin/contracts";
import type { PlacementPlan } from "@/features/editor/types/PlacementPlan";
import { getLayoutZones } from "@/features/editor/utils/getLayoutZones";
import { planPlacement } from "@/features/editor/utils/planPlacement";

// The variants (rotations and colors) of the family the asset belongs to. Empty
// when the asset is not in the library or is not a door.
const getDoorFamily = (
    model: Readonly<EditorModel>,
    doorAssetId: string
): AssetDefinition[] => {
    const door = model.library.assets.find(({ id }) => id === doorAssetId);
    if (door?.type !== ASSET_TYPES.DOOR) return [];

    const familyId = getFamilyId(door);
    return model.library.assets.filter(
        (asset) => getFamilyId(asset) === familyId
    );
};

// The footprint of the variant that fits each side. A side without an exact
// variant uses the base one, as the pick says.
const getSideSize = (
    family: AssetDefinition[],
    side: DoorSide
): { w: number; h: number } | null => {
    const pick = pickDoorVariantForSide(family, side);
    if (!pick) return null;

    const { w, h } = pick.variant.footprint;
    return { w, h };
};

const getSizeBySide = (
    family: AssetDefinition[]
): Record<DoorSide, { w: number; h: number }> | null => {
    const north = getSideSize(family, DOOR_SIDES.NORTH);
    const east = getSideSize(family, DOOR_SIDES.EAST);
    const south = getSideSize(family, DOOR_SIDES.SOUTH);
    const west = getSideSize(family, DOOR_SIDES.WEST);
    if (!north || !east || !south || !west) return null;

    return {
        [DOOR_SIDES.NORTH]: north,
        [DOOR_SIDES.EAST]: east,
        [DOOR_SIDES.SOUTH]: south,
        [DOOR_SIDES.WEST]: west,
    };
};

// Every cell a placed object covers, as "column,row" keys.
const getOccupiedKeys = (model: Readonly<EditorModel>): Set<string> => {
    const assetsById = new Map(model.library.assets.map((a) => [a.id, a]));
    const keys = new Set<string>();

    for (const placed of model.placed) {
        const asset = assetsById.get(placed.assetId);
        if (!asset) continue;

        const cells = getOccupiedCells({
            tileX: placed.tileX,
            tileY: placed.tileY,
            width: asset.footprint.w,
            height: asset.footprint.h,
            mask: asset.footprint.mask ?? null,
        });
        cells.forEach(({ x, y }) => keys.add(`${x},${y}`));
    }

    return keys;
};

// The spots where the door asset can go on the rooms of the map, one per gap
// in a wall. The size of each spot is the footprint of the variant that fits
// its side, and the cells under other objects are left out.
export const getDoorSlots = (
    model: EditorModel,
    doorAssetId: string
): DoorSlot[] => {
    const family = getDoorFamily(model, doorAssetId);
    const sizeBySide = getSizeBySide(family);
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
        getDoorFamily(model, doorAssetId),
        slot.side
    );
    if (!pick) return null;

    const plan = planPlacement(model, pick.variant.id, [
        slot.tileX,
        slot.tileY,
    ]);
    return { plan, exact: pick.exact };
};
