import { TILE_SIZE } from "@standin/contracts";
import { useOverlapDrag } from "../../../../hooks/editor/useOverlapDrag";
import { getPointerEvents } from "../../../../utils/editor/wall/getPointerEvents";
import { WALL_TILE_DRAWN_PX } from "./TileDrawing";

type Props = {
    // The rows of the tile, from the top, that cover the avatar.
    rows: number;
    disabled: boolean;
};

// The tile with a line at the height the wall stops covering the avatar. The
// part over the line is shaded. Press and drag to move it.
export const WallOverlapLine = ({ rows, disabled }: Props) => {
    const handlers = useOverlapDrag(WALL_TILE_DRAWN_PX);
    const height = (rows / TILE_SIZE) * WALL_TILE_DRAWN_PX;

    return (
        <div
            className="absolute inset-0 cursor-row-resize touch-none"
            style={{ pointerEvents: getPointerEvents(disabled) }}
            {...handlers}
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 bg-sky-500/25"
                style={{ height }}
            />
            <div
                className="pointer-events-none absolute inset-x-0 h-0.5 bg-sky-500"
                style={{ top: height }}
            />
        </div>
    );
};
