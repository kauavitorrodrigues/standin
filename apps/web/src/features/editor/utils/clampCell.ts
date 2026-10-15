import { worldToCell, type Cell } from "@standin/contracts";

const clamp = (value: number, max: number): number =>
    Math.min(max, Math.max(0, value));

// The cell under a world position, pulled to the nearest cell of the map when
// the position is outside it. A drag keeps following the pointer past the edge.
export const clampCell = (
    worldX: number,
    worldY: number,
    columns: number,
    rows: number
): Cell => {
    const [x, y] = worldToCell(worldX, worldY);
    return [clamp(x, columns - 1), clamp(y, rows - 1)];
};
