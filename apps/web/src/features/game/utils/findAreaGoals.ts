import type { Cell } from "@/features/game/types/cell";
import type { PlacedRect } from "@/features/game/utils/placed";
import { getCellAt, getCellCenter } from "@/features/game/utils/cell";

type Point = { x: number; y: number };

export type AreaGoalSearch = {
    area: PlacedRect;
    // Where the area was clicked, in px.
    click: Point;
    // The seats that nobody sits on, in px. The tiles that hold one are tried
    // first.
    freeSeats: readonly Point[];
    // Whether an avatar can stand on the tile.
    isOpen: (cell: Cell) => boolean;
};

const isInside = ({ x, y, width, height }: PlacedRect, point: Point) =>
    point.x >= x && point.x < x + width && point.y >= y && point.y < y + height;

/**
 * The tiles of an area to walk to, best first, like the Gather does when an
 * area is clicked: the open tiles of the area closest to the click, with the
 * ones that have a free seat ahead of all the others. The first is the goal
 * and the rest are the ones to try when it cannot be reached.
 */
export const findAreaGoals = ({
    area,
    click,
    freeSeats,
    isOpen,
}: AreaGoalSearch): Cell[] => {
    const first = getCellAt({ x: area.x, y: area.y });
    const last = getCellAt({
        x: area.x + area.width - 1,
        y: area.y + area.height - 1,
    });
    const seatCells = new Set(
        freeSeats.map(getCellAt).map(({ column, row }) => `${column},${row}`)
    );

    const candidates: { cell: Cell; isSeat: boolean; distance: number }[] = [];
    for (let column = first.column; column <= last.column; column++) {
        for (let row = first.row; row <= last.row; row++) {
            const cell = { column, row };
            const center = getCellCenter(cell);
            if (!isInside(area, center)) continue;
            if (!isOpen(cell)) continue;

            candidates.push({
                cell,
                isSeat: seatCells.has(`${column},${row}`),
                distance: Math.hypot(center.x - click.x, center.y - click.y),
            });
        }
    }

    candidates.sort(
        (a, b) => Number(b.isSeat) - Number(a.isSeat) || a.distance - b.distance
    );
    return candidates.map(({ cell }) => cell);
};
