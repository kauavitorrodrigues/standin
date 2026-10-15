import type { Zoom } from "../../../consts/editorZoom";
import type {
    FootprintMaskValue,
    SolidCell,
    SolidMaskValue,
} from "../../../types/footprintMask";
import type { Crop, Footprint } from "../../../types/spriteGeometry";
import { resolveSolidMask } from "../../../utils/solidMask";
import { getFootprintRect } from "../../../utils/spriteGeometry";
import { LayerBox } from "./LayerBox";
import { SolidCells } from "./SolidCells";
import { SolidRuns } from "./SolidRuns";

type Props = {
    // Null when the layer is hidden.
    opacity: number | null;
    // Whether the layer is the one being edited, which also draws the grid
    // and the cell under the pointer.
    active: boolean;
    // The asset has a collision to draw at all.
    available: boolean;
    zoom: Zoom;
    frame: Crop;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solidMask: SolidMaskValue;
    hoveredCell: SolidCell | null;
};

// The cells that block. Beside another layer it is only the cells, and only
// when they differ from the occupied tiles, since otherwise they add nothing
// to the footprint.
export const CollisionLayer = ({
    opacity,
    active,
    available,
    zoom,
    frame,
    footprint,
    mask,
    solidMask,
    hoveredCell,
}: Props) => {
    if (opacity === null || !available) return null;

    if (active) {
        return (
            <LayerBox opacity={opacity}>
                <SolidCells
                    zoom={zoom}
                    frame={frame}
                    footprint={footprint}
                    mask={mask}
                    solidMask={solidMask}
                    hoveredCell={hoveredCell}
                />
            </LayerBox>
        );
    }
    if (!solidMask) return null;

    return (
        <LayerBox opacity={opacity}>
            <SolidRuns
                zoom={zoom}
                rect={getFootprintRect(frame, footprint)}
                cells={resolveSolidMask(footprint, mask, solidMask)}
            />
        </LayerBox>
    );
};
