import type { Desk, DeskEvent } from "../types/desk";

// Next list of claimed desks after a socket event. A person holds one desk,
// so a claim also drops the previous desk of that person.
export const applyDeskEvent = (
    current: readonly Desk[],
    event: DeskEvent
): Desk[] => {
    const { mapAssetId, userId } = event.payload;

    switch (event.type) {
        case "claimed":
            return [
                ...current.filter(
                    (desk) =>
                        desk.mapAssetId !== mapAssetId && desk.userId !== userId
                ),
                { mapAssetId, userId },
            ];
        case "released":
            return current.filter((desk) => desk.mapAssetId !== mapAssetId);
    }
};
