import { findDoorSlots, readWallCells } from "@standin/contracts";
import type {
    DoorSide,
    DoorSlot,
    EditorModel,
    LooseLayout,
    Zone,
} from "@standin/contracts";
import type { DoorGap, TileSize } from "../../types";
import { getOccupiedKeys } from "./getOccupiedKeys";

const distance = (slot: DoorSlot, gap: DoorGap) =>
    Math.abs(slot.tileX - gap.tileX) + Math.abs(slot.tileY - gap.tileY);

/**
 * The slot of the room on that side, in the model as it is once the gap is
 * open, closest to where the gap was planned. The slots come from the shared
 * `findDoorSlots`, so a gap the editor would not offer is not found here.
 */
export const findDoorSlot = (
    model: EditorModel,
    zone: Zone,
    side: DoorSide,
    sizeBySide: Record<DoorSide, TileSize>,
    gap: DoorGap
): DoorSlot | undefined =>
    findDoorSlots({
        zones: [zone],
        wallCells: readWallCells(model.layout as unknown as LooseLayout),
        sizeBySide,
        occupiedCells: getOccupiedKeys(model),
        mapColumns: model.width,
        mapRows: model.height,
    })
        .filter((candidate) => candidate.side === side)
        .sort((a, b) => distance(a, gap) - distance(b, gap))[0];
