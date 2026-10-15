import { SOLID_GRID_LINE_COLOR } from "../../../consts/editorColors";
import type { Zoom } from "../../../consts/editorZoom";
import { SOLID_CELL_PX } from "../../../consts/solidMask";
import type { Crop } from "../../../types/spriteGeometry";

type Props = {
    zoom: Zoom;
    // The footprint on the image, in px.
    rect: Crop;
};

// The grid of cells over the footprint, finer than the grid of the tiles.
export const SolidGrid = ({ zoom, rect }: Props) => (
    <div
        className="pointer-events-none absolute"
        style={{
            left: rect.x * zoom,
            top: rect.y * zoom,
            width: rect.w * zoom,
            height: rect.h * zoom,
            backgroundImage: `linear-gradient(to right, transparent calc(100% - 1px), ${SOLID_GRID_LINE_COLOR} 0), linear-gradient(to bottom, transparent calc(100% - 1px), ${SOLID_GRID_LINE_COLOR} 0)`,
            backgroundSize: `${SOLID_CELL_PX * zoom}px ${SOLID_CELL_PX * zoom}px`,
        }}
    />
);
