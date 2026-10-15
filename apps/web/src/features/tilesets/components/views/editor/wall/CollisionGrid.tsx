import { WALL_COLLISION_CELLS } from "../../../../consts/wall";
import { useWallCollisionPainter } from "../../../../hooks/editor/useWallCollisionPainter";
import { getCollisionCellColor } from "../../../../utils/editor/wall/getCollisionCellColor";
import { getPointerEvents } from "../../../../utils/editor/wall/getPointerEvents";
import { WALL_TILE_DRAWN_PX } from "./TileDrawing";

type Props = {
    index: number;
    // The cells that block now, the whole tile when the tile has no mask.
    cells: boolean[][];
    disabled: boolean;
};

// The grid of cells over the tile, the ones that block in orange. Press and
// drag to paint or erase them.
export const WallCollisionGrid = ({ index, cells, disabled }: Props) => {
    const handlers = useWallCollisionPainter({
        index,
        drawnSizePx: WALL_TILE_DRAWN_PX,
    });
    const side = WALL_TILE_DRAWN_PX / WALL_COLLISION_CELLS;

    return (
        <div
            className="absolute inset-0 touch-none"
            style={{ pointerEvents: getPointerEvents(disabled) }}
            {...handlers}
        >
            {cells.flatMap((row, rowIndex) =>
                row.map((solid, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className="absolute border border-white/40"
                        style={{
                            left: colIndex * side,
                            top: rowIndex * side,
                            width: side,
                            height: side,
                            backgroundColor: getCollisionCellColor(solid),
                        }}
                    />
                ))
            )}
        </div>
    );
};
