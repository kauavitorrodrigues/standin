import type { Zoom } from "../../../consts/editorZoom";
import type { SolidCell } from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { getFootprintRect } from "../../../utils/spriteGeometry";
import { SolidGrid } from "./SolidGrid";
import { SolidHoveredCell } from "./SolidHoveredCell";
import { SolidRuns } from "./SolidRuns";

type Props = {
    zoom: Zoom;
    frame: Crop;
    footprint: Footprint;
    // The cells of the layer being edited.
    cells: boolean[][];
    // The color of the layer, for its cells, its outline and the cell under
    // the pointer.
    color: string;
    hoveredCell: SolidCell | null;
};

// A layer painted by cells while it is being edited: the grid of cells, the
// outline of the footprint and the cells themselves, in the color of the layer.
export const SolidCells = ({
    zoom,
    frame,
    footprint,
    cells,
    color,
    hoveredCell,
}: Props) => {
    const rect = getFootprintRect(frame, footprint);

    return (
        <>
            <SolidRuns zoom={zoom} rect={rect} cells={cells} color={color} />
            <SolidGrid zoom={zoom} rect={rect} />
            <div
                className="pointer-events-none absolute border-2"
                style={{
                    left: rect.x * zoom,
                    top: rect.y * zoom,
                    width: rect.w * zoom,
                    height: rect.h * zoom,
                    borderColor: color,
                }}
            />
            <SolidHoveredCell
                zoom={zoom}
                rect={rect}
                cell={hoveredCell}
                color={color}
            />
        </>
    );
};
