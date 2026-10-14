import { worldToCell, type Cell } from "@standin/contracts";

type Params = {
    worldX: number;
    worldY: number;
    columns: number;
    rows: number;
};

// The cell under a world position, or null when it is outside the map.
export const getHoverCell = ({
    worldX,
    worldY,
    columns,
    rows,
}: Params): Cell | null => {
    const cell = worldToCell(worldX, worldY);
    const [x, y] = cell;
    const isInside = x >= 0 && y >= 0 && x < columns && y < rows;

    if (!isInside) return null;
    return cell;
};
