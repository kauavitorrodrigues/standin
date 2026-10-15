import type { EditorModel } from "@standin/contracts";

export type RoomDoorLabel = { id: string; label: string; position: string };

// One label for each door of the list, numbered by position (left to right,
// then top to bottom) so the numbers do not jump when the model reorders.
export const getRoomDoorLabels = (
    model: Readonly<EditorModel>,
    doorIds: readonly string[]
): RoomDoorLabel[] => {
    const ids = new Set(doorIds);

    return model.placed
        .filter(({ id }) => ids.has(id))
        .sort((a, b) => a.tileX - b.tileX || a.tileY - b.tileY)
        .map((placed, index) => ({
            id: placed.id,
            label: `Porta ${index + 1}`,
            position: `coluna ${placed.tileX}, linha ${placed.tileY}`,
        }));
};
