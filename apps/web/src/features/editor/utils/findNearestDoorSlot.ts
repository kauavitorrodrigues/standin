import { type DoorSlot } from "@standin/contracts";

type TilePoint = { x: number; y: number };

// The center of the door footprint in tiles. The footprint grows to the right
// and upwards from the bottom left cell.
const getSlotCenter = (slot: DoorSlot): TilePoint => ({
    x: slot.tileX + slot.width / 2,
    y: slot.tileY + 1 - slot.height / 2,
});

// The slot whose center is closest to the point (in tiles), or null when none
// is within the radius. A tie keeps the first.
export const findNearestDoorSlot = (
    slots: readonly DoorSlot[],
    point: TilePoint,
    radius: number
): DoorSlot | null => {
    let nearest: DoorSlot | null = null;
    let nearestDistance = radius;

    for (const slot of slots) {
        const center = getSlotCenter(slot);
        const distance = Math.hypot(center.x - point.x, center.y - point.y);
        if (distance > nearestDistance) continue;
        if (nearest && distance >= nearestDistance) continue;

        nearest = slot;
        nearestDistance = distance;
    }

    return nearest;
};
