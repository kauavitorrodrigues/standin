import { FOOTPRINT_COLOR } from "../../../consts/editorColors";
import type { Zoom } from "../../../consts/editorZoom";
import type {
    FootprintMaskValue,
    SolidCell,
} from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { resolveMask } from "../../../utils/footprintMask";
import { getFootprintRect } from "../../../utils/spriteGeometry";
import { FootprintRects } from "./FootprintRects";
import { LayerBox } from "./LayerBox";
import { SolidCells } from "./SolidCells";
import { SolidRuns } from "./SolidRuns";

type Props = {
    // Null when the layer is hidden.
    opacity: number | null;
    // Whether the layer is the one being edited, which also draws the grid
    // and the cell under the pointer.
    active: boolean;
    zoom: Zoom;
    frame: Crop;
    frameCount: number;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solid: boolean;
    // The footprint is painted by cells, as it is for a still piece. Otherwise
    // it is one rectangle on each frame.
    byCells: boolean;
    hoveredCell: SolidCell | null;
};

// The footprint: the cells it occupies when it is painted by cells, one
// rectangle on each frame otherwise.
export const FootprintLayer = ({
    opacity,
    active,
    frameCount,
    byCells,
    mask,
    hoveredCell,
    ...shape
}: Props) => {
    if (opacity === null) return null;

    if (!byCells) {
        return (
            <LayerBox opacity={opacity}>
                <FootprintRects
                    zoom={shape.zoom}
                    frame={shape.frame}
                    footprint={shape.footprint}
                    solid={shape.solid}
                    frameCount={frameCount}
                />
            </LayerBox>
        );
    }

    const cells = resolveMask(shape.footprint, mask);
    if (active) {
        return (
            <LayerBox opacity={opacity}>
                <SolidCells
                    zoom={shape.zoom}
                    frame={shape.frame}
                    footprint={shape.footprint}
                    cells={cells}
                    color={FOOTPRINT_COLOR}
                    hoveredCell={hoveredCell}
                />
            </LayerBox>
        );
    }
    return (
        <LayerBox opacity={opacity}>
            <SolidRuns
                zoom={shape.zoom}
                rect={getFootprintRect(shape.frame, shape.footprint)}
                cells={cells}
                color={FOOTPRINT_COLOR}
            />
        </LayerBox>
    );
};
