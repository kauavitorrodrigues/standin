import { FOOTPRINT_COLOR } from "../../../consts/editorColors";
import type { Zoom } from "../../../consts/editorZoom";
import type {
    FootprintMaskValue,
    SolidCell,
    SolidMaskValue,
} from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { resolveSolidMask } from "../../../utils/solidMask";
import { getFootprintRect } from "../../../utils/spriteGeometry";
import { SolidGrid } from "./SolidGrid";
import { SolidHoveredCell } from "./SolidHoveredCell";
import { SolidRuns } from "./SolidRuns";

type Props = {
    zoom: Zoom;
    frame: Crop;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solidMask: SolidMaskValue;
    hoveredCell: SolidCell | null;
};

// The collision layer being edited: the grid of cells, the footprint outline
// and the cells that block. The tiles the footprint leaves free are drawn by
// the footprint layer. Without a collision mask every cell of an occupied tile
// blocks, so that is what is drawn.
export const SolidCells = ({
    zoom,
    frame,
    footprint,
    mask,
    solidMask,
    hoveredCell,
}: Props) => {
    const rect = getFootprintRect(frame, footprint);

    return (
        <>
            <SolidRuns
                zoom={zoom}
                rect={rect}
                cells={resolveSolidMask(footprint, mask, solidMask)}
            />
            <SolidGrid zoom={zoom} rect={rect} />
            <div
                className="pointer-events-none absolute border-2"
                style={{
                    left: rect.x * zoom,
                    top: rect.y * zoom,
                    width: rect.w * zoom,
                    height: rect.h * zoom,
                    borderColor: FOOTPRINT_COLOR,
                }}
            />
            <SolidHoveredCell zoom={zoom} rect={rect} cell={hoveredCell} />
        </>
    );
};
